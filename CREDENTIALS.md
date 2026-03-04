# Default Admin Credentials

## Superadmin Login

**Email**: `admin@schoolmanagement.com`  
**Password**: `Admin123!`

## Important Notes

- These are the default credentials created by the seed script
- **Change the password after first login in production!**
- The first user registered automatically becomes superadmin
- Only superadmin can create other users

## How to Change Password

Currently, password change functionality is not implemented in the API. To change the password:

1. Use MongoDB directly, or
2. Delete the user and create a new one, or
3. Implement a password change endpoint (future enhancement)

## Creating Additional Users

As superadmin, you can create:
- Other superadmins
- School administrators (must be assigned to a school)
