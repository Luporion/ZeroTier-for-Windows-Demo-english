# Self-Hosted Controller Support

## Overview

ZeroTier for Windows now supports self-hosted controllers (like ZeroUI or ztncui) that are accessible only over a private ZeroTier network. This feature allows you to manage networks using custom controller APIs without relying on the official ZeroTier Central API.

## Use Cases

1. **Private Admin Networks**: Run a controller instance on a private ZeroTier network that only admins can access
2. **Corporate Environments**: Use internal controllers with custom security policies
3. **Development/Testing**: Test with local controller instances before deploying to production
4. **Air-Gapped Networks**: Manage completely isolated networks without internet connectivity

## How to Configure

### Step 1: Set Up Your Self-Hosted Controller

First, ensure you have a self-hosted ZeroTier controller running and accessible via your ZeroTier network. Popular options include:

- **ZeroUI**: A web-based UI for ZeroTier controllers
- **ztncui**: ZeroTier Network Controller UI

Make sure your controller is:
- Running and accessible via HTTP/HTTPS
- Has an API endpoint compatible with ZeroTier Central API
- You have an admin API token

### Step 2: Join Your Admin Network

1. In ZeroTier for Windows, join the ZeroTier network where your controller is hosted
2. Wait for the network to connect and get an IP address
3. Note the IP address assigned to your controller instance

### Step 3: Configure Controller URL

1. **Right-click** on the network you want to manage
2. Select **"Admin Token"** from the context menu
3. In the dialog that appears:
   - **Admin Token**: Enter your controller's API token
   - **Controller URL**: Enter the base URL of your controller's API
     - Example: `http://192.168.195.10:3000/api/v1/`
     - Example: `http://10.147.20.5:4000/api/`
4. Click **Confirm**

### Step 4: Verify Configuration

Once configured:
- The controller URL will appear below the network info in the network details panel
- All admin operations (member authorization, syncing, etc.) will use your custom controller
- You can click on the controller URL to copy it to clipboard

## URL Format

The controller URL should follow this format:

```
<protocol>://<zerotier-ip>:<port>/<api-path>/
```

### Examples

#### ZeroUI
```
http://192.168.195.10:3000/api/v1/
```

#### ztncui
```
http://10.147.20.5:3443/api/
```

**Important Notes:**
- Always include the trailing slash (`/`)
- Use the ZeroTier-assigned IP address, not localhost or external IPs
- Ensure the protocol (http/https) matches your controller configuration
- The API path should point to the base of the ZeroTier-compatible API

## Security Considerations

1. **Network Isolation**: Only users on the admin ZeroTier network can reach the controller
2. **Token Security**: Store your admin tokens securely; they grant full network management access
3. **HTTPS**: Consider using HTTPS with valid certificates for production deployments
4. **Firewall Rules**: Configure your controller to only accept connections from the ZeroTier network interface

## Troubleshooting

### Controller Not Responding

- Verify the controller is running and accessible via the ZeroTier network
- Test connectivity: `ping <controller-ip>` from another device on the network
- Check the controller logs for any errors
- Ensure the API endpoint URL is correct (including trailing slash)

### Authentication Failures

- Verify your admin token is correct and not expired
- Check that the token has permissions for the specific network
- Ensure the controller API is compatible with ZeroTier Central API

### Operations Fail After Configuration

- Verify the controller URL format is correct
- Check that all API endpoints are accessible at the configured URL
- Review browser console and application logs for specific error messages

## Switching Back to Official API

To switch a network back to using the official ZeroTier Central API:

1. Right-click on the network
2. Select "Admin Token"
3. Clear the "Controller URL" field (leave it empty)
4. Click Confirm

The network will now use the official API at `https://api.zerotier.com/api/v1/`

## API Compatibility

The self-hosted controller must implement these ZeroTier Central API endpoints:

- `GET /network` - List networks
- `GET /network/{networkId}` - Get network details
- `POST /network/{networkId}` - Update network
- `GET /network/{networkId}/member` - List network members
- `GET /network/{networkId}/member/{nodeId}` - Get member details
- `POST /network/{networkId}/member/{nodeId}` - Update member

## Feature Support Matrix

| Feature | Official API | Self-Hosted Controller |
|---------|--------------|------------------------|
| Join/Leave Networks | ✅ | ✅ |
| View Network Details | ✅ | ✅ |
| Authorize Members | ✅ | ✅ |
| Sync Member Info | ✅ | ✅ |
| Update Member Names | ✅ | ✅ |
| Network Tags | ✅ | ⚠️ (Depends on controller) |

## Additional Resources

- [ZeroTier Controller API Documentation](https://docs.zerotier.com/central/v1/)
- [ZeroUI GitHub Repository](https://github.com/dec0dOS/zero-ui)
- [ztncui GitHub Repository](https://github.com/key-networks/ztncui)
