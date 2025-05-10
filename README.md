# CLI Password Vault

## Overview
The CLI Password Vault is a command-line application designed to securely store and manage passwords for various sites. It uses AES-256-CBC encryption to ensure that sensitive data remains protected.

## Features
- **Password Encryption and Decryption**: All passwords are encrypted before being saved and decrypted when retrieved.
- **Password Retrieval**: Retrieve stored passwords by site name.
- **Password Update**: Update existing passwords for a specific site.
- **Secure Key Management**: Encryption keys are securely stored in `key.json`.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd CLI
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage
### Add a Password
Run the application and follow the prompts to add a new password.

### Retrieve a Password
Use the `getPassword` function to retrieve a password for a specific site.

### Update a Password
Use the `updatePassword` function to update the password for an existing site.

## Security
- Sensitive files like `passwords.json` and `key.json` are excluded from version control using `.gitignore`.
- Ensure that file permissions are set to restrict access to these files.

## Contributing
Feel free to fork the repository and submit pull requests for new features or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
