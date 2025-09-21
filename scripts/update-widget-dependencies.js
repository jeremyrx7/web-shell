#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { execSync } = require("child_process");

/**
 * Script to update widget dependencies in package.json
 * Compares current and new package versions, updates only if needed,
 * and outputs detailed information for GitHub Actions workflow
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
      // Get input data from environment variables
      const packagesToUpdate = this.getPackagesToUpdate();
      const forceUpdate = process.env.FORCE_UPDATE === "true";

      console.log("🔄 Widget Dependency Updater Starting...");
      console.log(`📦 Packages to process: ${packagesToUpdate.length}`);
      console.log(`🔧 Force update: ${forceUpdate}`);

      if (packagesToUpdate.length === 0) {
        console.log("ℹ️  No packages to update");
        console.log("   This could be due to:");
        console.log("   - No packages were published");
        console.log("   - Invalid JSON data from GitHub Actions");
        console.log("   - JSON parsing failed (check raw data above)");
        console.log("   - All packages are already up to date");
        this.outputResults();
        return;
      }

      // Read current package.json
      const currentPackageJson = await this.readPackageJson();
      const originalDependencies = { ...currentPackageJson.dependencies };

      // Process each package
      for (const pkg of packagesToUpdate) {
        await this.updatePackage(pkg, currentPackageJson, forceUpdate);
      }

      // Compare and save if changes were made
      const hasChanges = this.hasPackageChanges(
        originalDependencies,
        currentPackageJson.dependencies,
      );

      if (hasChanges || forceUpdate) {
        await this.savePackageJson(currentPackageJson);
        await this.updateLockFile();
        this.results.hasChanges = true;
        console.log("✅ Package.json updated successfully");
      } else {
        console.log(
          "ℹ️  No changes needed - all packages are already up to date",
        );
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
   * Get packages to update from environment variables
   */
  getPackagesToUpdate() {
    const packagesEnv = process.env.PACKAGES_TO_UPDATE || "[]";

    console.log(`🔍 Raw PACKAGES_TO_UPDATE: "${packagesEnv}"`);
    console.log(`🔍 Type: ${typeof packagesEnv}`);
    console.log(`🔍 Length: ${packagesEnv.length}`);

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
   * Save package.json with proper formatting
   */
  async savePackageJson(packageJson) {
    try {
      const content = JSON.stringify(packageJson, null, 2) + "\n";
      await fs.writeFile(this.packageJsonPath, content, "utf8");
    } catch (error) {
      throw new Error(`Failed to save package.json: ${error.message}`);
    }
  }

  /**
   * Update a specific package
   */
  async updatePackage(pkg, packageJson, forceUpdate) {
    const { name, version } = pkg;
    const currentVersion = packageJson.dependencies?.[name];

    console.log(`\n📦 Processing ${name}`);
    console.log(`   Current: ${currentVersion || "not installed"}`);
    console.log(`   Target:  ${version}`);

    // Check if update is needed
    if (!forceUpdate && currentVersion === version) {
      console.log(`   ℹ️  Already up to date`);
      return;
    }

    if (!forceUpdate && currentVersion === `^${version}`) {
      console.log(`   ℹ️  Already satisfied by range ^${version}`);
      return;
    }

    try {
      // Verify package exists and is accessible
      await this.verifyPackageExists(name, version);

      // Update package.json dependencies
      if (!packageJson.dependencies) {
        packageJson.dependencies = {};
      }

      const oldVersion = packageJson.dependencies[name];
      packageJson.dependencies[name] = version;

      this.results.updatedPackages.push({
        name,
        oldVersion: oldVersion || null,
        newVersion: version,
        action: oldVersion ? "updated" : "added",
      });

      console.log(
        `   ✅ Updated ${name}: ${oldVersion || "none"} → ${version}`,
      );
    } catch (error) {
      const errorInfo = {
        package: name,
        version,
        message: error.message,
      };

      this.results.errors.push(errorInfo);
      console.log(`   ❌ Failed to update ${name}: ${error.message}`);
    }
  }

  /**
   * Verify that a package version exists and is accessible
   */
  async verifyPackageExists(name, version) {
    try {
      const command = `npm view ${name}@${version} version --silent`;
      const result = execSync(command, {
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"],
      }).trim();

      if (result !== version) {
        throw new Error(`Version mismatch: expected ${version}, got ${result}`);
      }
    } catch (error) {
      if (
        error.message.includes("404") ||
        error.message.includes("Not Found")
      ) {
        throw new Error(`Package ${name}@${version} not found in registry`);
      }
      throw new Error(`Package verification failed: ${error.message}`);
    }
  }

  /**
   * Update package-lock.json by running npm install
   */
  async updateLockFile() {
    try {
      console.log("\n🔄 Updating package-lock.json...");
      execSync("npm install --package-lock-only", {
        stdio: ["pipe", "pipe", "pipe"],
        encoding: "utf8",
      });
      console.log("✅ package-lock.json updated");
    } catch (error) {
      const errorInfo = {
        type: "lockfile",
        message: `Failed to update package-lock.json: ${error.message}`,
      };
      this.results.errors.push(errorInfo);
      console.log(`⚠️  Failed to update package-lock.json: ${error.message}`);
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
    this.results.summary = {
      totalPackagesProcessed:
        this.results.updatedPackages.length + this.results.errors.length,
      successfulUpdates: this.results.updatedPackages.length,
      failedUpdates: this.results.errors.length,
      hasChanges: this.results.hasChanges,
      updatedPackages: this.results.updatedPackages.map((pkg) => ({
        name: pkg.name,
        change: `${pkg.oldVersion || "none"} → ${pkg.newVersion}`,
        action: pkg.action,
      })),
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
      `   Successful updates: ${this.results.summary.successfulUpdates}`,
    );
    console.log(`   Failed updates: ${this.results.summary.failedUpdates}`);
    console.log(`   Has changes: ${this.results.hasChanges}`);

    if (this.results.updatedPackages.length > 0) {
      console.log("\n✅ Successfully Updated Packages:");
      this.results.updatedPackages.forEach((pkg) => {
        console.log(
          `   - ${pkg.name}: ${pkg.oldVersion || "none"} → ${pkg.newVersion} (${pkg.action})`,
        );
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
