#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

/**
 * Script to update widget dependencies in package.json
 * Simply loops through packages and runs npm install for each one
 *
 * Environment Variables:
 * - PACKAGES_TO_UPDATE: JSON array of packages to update
 * - FORCE_UPDATE: Boolean to force updates even if no changes detected
 */

class WidgetDependencyUpdater {
  constructor() {
    this.packageJsonPath = path.join(process.cwd(), "package.json");
    this.results = {
      hasChanges: false,
      updatedPackages: [],
      errors: [],
      summary: {},
    };
  }

  /**
   * Main execution function
   */
  async run() {
    try {
      // Configure npm authentication first
      await this.configureNpmAuth();

      // Get input data from environment variables
      const packagesToUpdate = this.getPackagesToUpdate();
      const forceUpdate = process.env.FORCE_UPDATE === "true";

      console.log("🔄 Widget Dependency Updater Starting...");
      console.log(`📦 Packages to process: ${packagesToUpdate.length}`);
      console.log(`🔧 Force update: ${forceUpdate}`);

      if (packagesToUpdate.length === 0) {
        console.log("ℹ️  No packages to update");
        this.outputResults();
        return;
      }

      // Read current package.json to track changes
      const originalPackageJson = await this.readPackageJson();
      const originalDependencies = { ...originalPackageJson.dependencies };

      // Process each package
      for (const pkg of packagesToUpdate) {
        await this.installPackage(pkg);
      }

      // Check if package.json was modified
      const currentPackageJson = await this.readPackageJson();
      const hasChanges = this.hasPackageChanges(
        originalDependencies,
        currentPackageJson.dependencies,
      );

      this.results.hasChanges = hasChanges || forceUpdate;

      if (hasChanges) {
        console.log("✅ Package.json was updated with new dependencies");
      } else if (forceUpdate) {
        console.log("🔧 Force update enabled - marking as changed");
      } else {
        console.log("ℹ️  No changes detected in package.json");
      }

      this.generateSummary(
        originalDependencies,
        currentPackageJson.dependencies,
      );
      this.outputResults();
    } catch (error) {
      console.error("❌ Fatal error:", error.message);
      this.results.errors.push({
        type: "fatal",
        message: error.message,
        stack: error.stack,
      });
      this.outputResults();
      process.exit(1);
    }
  }

  /**
   * Configure npm authentication using npm config commands
   */
  async configureNpmAuth() {
    const npmToken = process.env.NPM_TOKEN;

    console.log("🔑 Configuring npm authentication...");

    if (!npmToken) {
      console.log(
        "⚠️  NPM_TOKEN not found - continuing without authentication",
      );
      return;
    }

    try {
      // Configure registry for @jeremyrx7 scope
      execSync(
        "npm config set @jeremyrx7:registry https://npm.pkg.github.com",
        {
          stdio: ["pipe", "pipe", "pipe"],
          env: process.env,
        },
      );

      // Configure auth token for GitHub Packages
      execSync(`npm config set //npm.pkg.github.com/:_authToken ${npmToken}`, {
        stdio: ["pipe", "pipe", "pipe"],
        env: process.env,
      });

      console.log("✅ npm authentication configured");
    } catch (error) {
      console.log(
        `⚠️  Failed to configure npm authentication: ${error.message}`,
      );
      throw error; // This is critical, so we should fail if auth setup fails
    }
  }

  /**
   * Get packages to update from environment variables
   */
  getPackagesToUpdate() {
    const packagesEnv = process.env.PACKAGES_TO_UPDATE || "[]";

    console.log(`🔍 Raw PACKAGES_TO_UPDATE: "${packagesEnv}"`);

    try {
      const packages = JSON.parse(packagesEnv);
      console.log(
        `✅ Parsed packages successfully: ${JSON.stringify(packages, null, 2)}`,
      );

      if (!Array.isArray(packages)) {
        console.warn("⚠️  Parsed data is not an array, converting to array");
        return packages ? [packages] : [];
      }

      return packages;
    } catch (error) {
      console.error("❌ Failed to parse PACKAGES_TO_UPDATE");
      console.error(`   Raw value: "${packagesEnv}"`);
      console.error(`   Error: ${error.message}`);
      console.error("   Using empty array as fallback");
      return [];
    }
  }

  /**
   * Read and parse package.json
   */
  async readPackageJson() {
    try {
      const content = await fs.readFile(this.packageJsonPath, "utf8");
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to read package.json: ${error.message}`);
    }
  }

  /**
   * Install a specific package using npm install
   */
  async installPackage(pkg) {
    const { name, version } = pkg;

    console.log(`\n📦 Installing ${name}@${version}`);

    try {
      // Run npm install for this specific package
      const command = `npm install ${name}@${version} --save`;
      console.log(`   🔄 Running: ${command}`);

      const result = execSync(command, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
        timeout: 60000, // 60 second timeout
        env: process.env,
        cwd: process.cwd(),
      });

      this.results.updatedPackages.push({
        name,
        version,
        action: "installed",
      });

      console.log(`   ✅ Successfully installed ${name}@${version}`);
    } catch (error) {
      const errorInfo = {
        package: name,
        version,
        message: error.message,
      };

      this.results.errors.push(errorInfo);
      console.log(
        `   ❌ Failed to install ${name}@${version}: ${error.message}`,
      );

      // Log stderr if available for more details
      if (error.stderr) {
        console.log(`   📝 Error details: ${error.stderr.toString()}`);
      }
    }
  }

  /**
   * Check if there are changes between original and current dependencies
   */
  hasPackageChanges(original, current) {
    const originalKeys = Object.keys(original || {});
    const currentKeys = Object.keys(current || {});

    // Check for added or removed packages
    if (originalKeys.length !== currentKeys.length) {
      return true;
    }

    // Check for version changes
    for (const key of originalKeys) {
      if (original[key] !== current[key]) {
        return true;
      }
    }

    return false;
  }

  /**
   * Generate summary of changes
   */
  generateSummary(originalDeps, currentDeps) {
    const updatedPackages = [];

    // Find packages that were actually updated
    for (const pkg of this.results.updatedPackages) {
      const oldVersion = originalDeps[pkg.name];
      const newVersion = currentDeps[pkg.name];

      if (oldVersion !== newVersion) {
        updatedPackages.push({
          name: pkg.name,
          change: `${oldVersion || "none"} → ${newVersion}`,
          action: oldVersion ? "updated" : "added",
        });
      }
    }

    this.results.summary = {
      totalPackagesProcessed:
        this.results.updatedPackages.length + this.results.errors.length,
      successfulInstalls: this.results.updatedPackages.length,
      failedInstalls: this.results.errors.length,
      actualUpdates: updatedPackages.length,
      hasChanges: this.results.hasChanges,
      updatedPackages: updatedPackages,
    };
  }

  /**
   * Output results for GitHub Actions
   */
  outputResults() {
    // Output for GitHub Actions step outputs
    const outputs = {
      "has-changes": this.results.hasChanges.toString(),
      "updated-packages": JSON.stringify(this.results.updatedPackages),
      errors: JSON.stringify(this.results.errors),
      summary: JSON.stringify(this.results.summary),
    };

    // Write to GitHub Actions outputs
    for (const [key, value] of Object.entries(outputs)) {
      console.log(`::set-output name=${key}::${value}`);
    }

    // Also write to environment file if available
    const githubOutput = process.env.GITHUB_OUTPUT;
    if (githubOutput) {
      const fs = require("fs");
      for (const [key, value] of Object.entries(outputs)) {
        fs.appendFileSync(githubOutput, `${key}=${value}\n`);
      }
    }

    // Summary output for logs
    console.log("\n📊 Update Summary:");
    console.log(
      `   Total packages processed: ${this.results.summary.totalPackagesProcessed}`,
    );
    console.log(
      `   Successful installs: ${this.results.summary.successfulInstalls}`,
    );
    console.log(`   Failed installs: ${this.results.summary.failedInstalls}`);
    console.log(`   Actual updates: ${this.results.summary.actualUpdates}`);
    console.log(`   Has changes: ${this.results.hasChanges}`);

    if (this.results.summary.updatedPackages.length > 0) {
      console.log("\n✅ Successfully Updated Packages:");
      this.results.summary.updatedPackages.forEach((pkg) => {
        console.log(`   - ${pkg.name}: ${pkg.change} (${pkg.action})`);
      });
    }

    if (this.results.errors.length > 0) {
      console.log("\n❌ Errors:");
      this.results.errors.forEach((error) => {
        console.log(`   - ${error.package || "General"}: ${error.message}`);
      });
    }
  }
}

// Run the updater if this script is executed directly
if (require.main === module) {
  const updater = new WidgetDependencyUpdater();
  updater.run().catch((error) => {
    console.error("Script execution failed:", error);
    process.exit(1);
  });
}

module.exports = WidgetDependencyUpdater;
