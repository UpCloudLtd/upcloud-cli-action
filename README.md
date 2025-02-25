# UpCloud CLI for GitHub Actions

A GitHub Action that installs and configures the [UpCloud CLI](https://github.com/UpCloudLtd/upcloud-cli) (`upctl`) for managing UpCloud infrastructure in your GitHub Actions workflows.

## Features

- Automatically installs the UpCloud CLI tool
- Configures authentication with your UpCloud API credentials
- Supports specific version installation or latest version
- Works across different operating systems (Linux, macOS, Windows)

## Usage

### Basic Example

```yaml
name: Deploy to UpCloud

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup UpCloud CLI
        uses: upcloudltd/upcloud-cli-action@v1
        with:
          username: ${{ secrets.UPCLOUD_USERNAME }}
          password: ${{ secrets.UPCLOUD_PASSWORD }}

      - name: List UpCloud servers
        run: upctl server list
```

### Inputs

| Input      | Description                       | Required | Default  |
|------------|-----------------------------------|----------|----------|
| `username` | UpCloud API Username              | Yes      | -        |
| `password` | UpCloud API Password              | Yes      | -        |
| `version`  | UpCloud CLI version to install    | No       | `latest` |

## Authentication

Store your UpCloud API credentials as GitHub secrets:

1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Create secrets for `UPCLOUD_USERNAME` and `UPCLOUD_PASSWORD`
3. Use these secrets in your workflow as shown in the example above

## Examples

### Deploy to Kubernetes with Helm

```yaml
steps:
  - name: Setup UpCloud CLI
    uses: upcloudltd/upcloud-cli-action@v1
    with:
      username: ${{ secrets.UPCLOUD_USERNAME }}
      password: ${{ secrets.UPCLOUD_PASSWORD }}

  - name: Setup Helm
    uses: azure/setup-helm@v3

  - name: Generate kubeconfig
    run: |
      upctl kubernetes config my-cluster --write kubeconfig.yaml
      echo "KUBECONFIG=kubeconfig.yaml" >> $GITHUB_ENV

  - name: Deploy with Helm
    run: |
      helm repo add bitnami https://charts.bitnami.com/bitnami
      helm upgrade --install my-app bitnami/nginx --namespace my-namespace --create-namespace
```

### Use a Specific upctl Version

```yaml
steps:
  - name: Setup UpCloud CLI
    uses: upcloudltd/upcloud-cli-action@v1
    with:
      username: ${{ secrets.UPCLOUD_USERNAME }}
      password: ${{ secrets.UPCLOUD_PASSWORD }}
      version: '2.0.0'  # Specify a version
```

## License

This project is licensed under the [MIT License](LICENSE).
