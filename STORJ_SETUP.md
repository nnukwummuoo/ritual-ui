# Storj Migration Setup for Frontend

This frontend has been migrated from Appwrite to Storj for file storage. The migration maintains the same API interface while using Storj via the backend API.

## Migration Changes

### Files Modified:
1. **Created**: `src/lib/storj.ts` - New Storj utility functions for frontend
2. **Updated**: `src/api/sendImage.ts` - Now re-exports Storj functions
3. **Updated**: `src/app/creator/CreateCreatorPortfolio.tsx` - Removed direct Appwrite usage
4. **Updated**: `src/app/message/_components/Chat.tsx` - Updated comments
5. **Updated**: `src/app/quickchat/_components/QuickChatConversation.tsx` - Updated comments
6. **Updated**: `package.json` - Removed Appwrite dependency

### Key Changes:

#### 1. **Removed Direct Appwrite Usage**
- No more direct Appwrite SDK calls in frontend components
- All file uploads now go through the backend API (which uses Storj)

#### 2. **New Storj Utility Functions**
- `uploadToStorj(file, folder)` - Upload single file to Storj via backend
- `uploadMultipleFilesToStorj(files, folder)` - Upload multiple files
- `deleteFromStorj(publicId)` - Delete file from Storj
- `getStorjViewUrl(publicId)` - Get file view URL
- `saveToStorj(fileOrUrl, folder)` - Save file (compatible with existing API)

#### 3. **Backward Compatibility**
- All existing function names are maintained via re-exports
- `uploadImage`, `deleteImage`, `getViewUrl`, `saveImage` still work
- No breaking changes to existing component code

### Environment Variables

The frontend no longer needs Appwrite environment variables. All file operations are handled through the backend API which uses Storj.

**Removed (no longer needed):**
```env
NEXT_PUBLIC_APPWRITE_ENDPOINT
NEXT_PUBLIC_APPWRITE_PROJECT_ID
```

**Backend still needs (configured in mmekoapi/.env):**
```env
STORJ_ACCESS_KEY_ID=juqbkmfqqjtntrdt6km7xitpiboq
STORJ_SECRET_ACCESS_KEY=jzpjv2smjnmvrkfpdsvybjruwhsrpkcmjeblw2vmwuambsxpkcwna
STORJ_ENDPOINT=https://gateway.storjshare.io
STORJ_BUCKET_DEFAULT=post
STORJ_BUCKET_POST=post
STORJ_BUCKET_PROFILE=profile
STORJ_BUCKET_CREATOR=creator
STORJ_BUCKET_CREATOR_APPLICATION=creator-application
STORJ_BUCKET_MESSAGE=message
```

### How It Works Now

1. **File Upload Flow:**
   ```
   Frontend Component → Storj Utility → Backend API → Storj Storage
   ```

2. **File Access Flow:**
   ```
   Frontend Component → Backend API → Storj Storage → File URL
   ```

3. **File Deletion Flow:**
   ```
   Frontend Component → Backend API → Storj Storage (delete)
   ```

### Benefits of Migration

1. **Simplified Frontend**: No direct storage SDK dependencies
2. **Centralized Storage Logic**: All storage operations handled by backend
3. **Better Security**: Storage credentials only on backend
4. **Consistent API**: Same interface across all components
5. **Easier Maintenance**: Single point of storage configuration

### Testing

After the migration, test the following functionality:
1. ✅ File uploads in creator portfolio creation
2. ✅ File uploads in chat messages
3. ✅ File uploads in quick chat
4. ✅ Image/video uploads in posts
5. ✅ File deletion operations
6. ✅ File viewing/access

### Notes

- The frontend now relies entirely on the backend API for file operations
- All file URLs returned are direct Storj URLs or proxy URLs from the backend
- The migration maintains full backward compatibility
- No changes needed to existing component logic beyond import statements
