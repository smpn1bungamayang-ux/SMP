export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  description?: string;
}

export interface DriveQuotaInfo {
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
  storageQuota?: {
    limit?: string;
    usage?: string;
    usageInDrive?: string;
  };
}

const DEFAULT_FOLDER_NAME = 'PILKETOS SMPN 01 BUNGA MAYANG 2026';

/**
 * Finds or creates the dedicated election folder in Google Drive
 */
export async function getOrCreateElectionFolder(
  accessToken: string,
  folderName: string = DEFAULT_FOLDER_NAME
): Promise<{ id: string; name: string }> {
  const query = encodeURIComponent(`name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`;

  const searchRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!searchRes.ok) {
    const errorText = await searchRes.text();
    throw new Error(`Gagal mencari folder Google Drive: ${searchRes.status} ${errorText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Folder arsip resmi dokumen, DPT, dan Berita Acara PILKETOS SMP Negeri 01 Bunga Mayang',
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Gagal membuat folder Google Drive: ${createRes.status} ${errText}`);
  }

  return await createRes.json();
}

/**
 * Uploads a file (text, CSV, JSON, HTML) using multipart upload
 */
export async function uploadFileToDrive(
  accessToken: string,
  params: {
    name: string;
    mimeType: string;
    content: string;
    folderId?: string;
    description?: string;
  }
): Promise<DriveFileItem> {
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata: Record<string, unknown> = {
    name: params.name,
    mimeType: params.mimeType,
    description: params.description || 'Berkas E-PILKETOS SMPN 01 Bunga Mayang',
  };

  if (params.folderId) {
    metadata.parents = [params.folderId];
  }

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${params.mimeType}; charset=UTF-8\r\n\r\n` +
    params.content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,modifiedTime,webViewLink,webContentLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengunggah ke Google Drive: ${res.status} ${errText}`);
  }

  return await res.json();
}

/**
 * Lists all election files inside the election folder (or matching PILKETOS)
 */
export async function listElectionFiles(
  accessToken: string,
  folderId?: string
): Promise<DriveFileItem[]> {
  let query = 'trashed=false';
  if (folderId) {
    query += ` and '${folderId}' in parents`;
  } else {
    query += ` and (name contains 'PILKETOS' or name contains 'DPT' or name contains 'BERITA_ACARA')`;
  }

  const encodedQuery = encodeURIComponent(query);
  const fields = encodeURIComponent('files(id,name,mimeType,size,modifiedTime,webViewLink,webContentLink,iconLink,description)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodedQuery}&fields=${fields}&orderBy=modifiedTime desc&pageSize=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal memuat daftar berkas dari Google Drive: ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Downloads a text file content (e.g. CSV or JSON) from Google Drive
 */
export async function downloadFileContent(
  accessToken: string,
  fileId: string
): Promise<string> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengunduh isi berkas Google Drive: ${res.status} ${errText}`);
  }

  return await res.text();
}

/**
 * Deletes a file from Google Drive
 * CAUTION: Caller MUST ensure user confirmed this action in a confirmation dialog first!
 */
export async function deleteDriveFile(
  accessToken: string,
  fileId: string
): Promise<void> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok && res.status !== 204) {
    const errText = await res.text();
    throw new Error(`Gagal menghapus berkas di Google Drive: ${res.status} ${errText}`);
  }
}

/**
 * Gets user and storage information from Google Drive
 */
export async function getDriveProfile(
  accessToken: string
): Promise<DriveQuotaInfo> {
  const url = 'https://www.googleapis.com/drive/v3/about?fields=user,storageQuota';
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gagal mengambil profil Google Drive: ${res.status} ${errText}`);
  }

  return await res.json();
}
