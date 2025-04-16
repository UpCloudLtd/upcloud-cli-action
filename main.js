const core = require('@actions/core');
const tc = require('@actions/tool-cache');
const exec = require('@actions/exec');
const { Octokit } = require('@octokit/rest');
const path = require('path');
const fs = require('fs');

const PLATFORMS = {
  'win32': 'windows',
  'darwin': 'darwin',
  'linux': 'linux',
  'freebsd': 'freebsd',
};

const ARCHITECTURES = {
  'x64': 'x86_64',
  'arm64': 'arm64'
};

// Retrieves the latest version of the UpCloud CLI binary
async function getVersion(requestedVersion) {
  if (requestedVersion && requestedVersion.toLowerCase() !== 'latest') {
    return requestedVersion.replace(/^v/, '');
  }
  
  const octokit = new Octokit();
    
  const { data } = await octokit.repos.getLatestRelease({
    owner: 'UpCloudLtd',
    repo: 'upcloud-cli'
  });

  return data.tag_name.replace(/^v/, '');
}

// Installs the UpCloud CLI binary to the tool cache
async function setupCLI(version) {
  const toolName = process.platform === 'win32' ? 'upctl.exe' : 'upctl';
  let toolPath = tc.find(toolName, version);
    
  if (!toolPath) {
    const installPath = await downloadCLI(version, process.platform, process.arch);
      
    // Ensure binary exists and is in the expected location
    const binaryPath = path.join(installPath, toolName);
    if (!fs.existsSync(binaryPath)) {
      throw new Error(`UpCloud CLI binary not found at ${binaryPath}`);
    }
      
    // Cache the directory containing the binary
    toolPath = await tc.cacheDir(installPath, toolName, version);
  }
  core.addPath(toolPath);
  core.info(`✓ UpCloud CLI version v${version} installed to ${toolPath}`);
  return toolPath;
}

// Downloads the UpCloud CLI binary from the GitHub release page
async function downloadCLI(version, platform, arch) {
  try {
    const mappedPlatform = PLATFORMS[platform] ?? platform;
    const mappedArch = ARCHITECTURES[arch] ?? arch;
    
    const downloadUrl = buildDownloadUrl(version, mappedPlatform, mappedArch);
    core.info(`⬇️ Downloading UpCloud CLI from ${downloadUrl}`);
    
    const downloadPath = await tc.downloadTool(downloadUrl);
    return mappedPlatform === 'windows' 
      ? await tc.extractZip(downloadPath)
      : await tc.extractTar(downloadPath);
  } catch (error) {
    throw new Error(`Unable to download UpCloud CLI: ${error.message}`);
  }
}

// Builds the download URL for the UpCloud CLI binary
function buildDownloadUrl(version, platform, arch) {
  const extension = platform === 'windows' ? 'zip' : 'tar.gz';
  return `https://github.com/UpCloudLtd/upcloud-cli/releases/download/v${version}/upcloud-cli_${version}_${platform}_${arch}.${extension}`;
}

// Configures authentication for the UpCloud CLI binary
async function configureAuthentication() {
  const username = core.getInput('username', { required: true });
  const password = core.getInput('password', { required: true });
  
  // Mask sensitive values in logs
  core.setSecret(username);
  core.setSecret(password);

  // Set environment variables for authentication
  core.exportVariable('UPCLOUD_USERNAME', username);
  core.exportVariable('UPCLOUD_PASSWORD', password);

  // Use platform-specific command
  const command = process.platform === 'win32' ? 'upctl.exe' : 'upctl';
  await exec.exec(command, ['account', 'show'], { silent: true });
  core.info('✓ UpCloud CLI authentication verified successfully');
}

// Main function to run the action
async function run() {
  try {
    const version = await getVersion(core.getInput('version'));
    await setupCLI(version);
    await configureAuthentication();
  } catch (error) {
    core.setFailed(error.message);
  }
}

run(); 