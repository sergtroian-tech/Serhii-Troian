import { Email, EmailFolder, EmailAttachment } from '../types';

// Helper to decode Base64URL string with proper UTF-8 handling
function decodeBase64Url(base64Url: string): string {
  try {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (err) {
    console.warn('Failed to decode base64 body:', err);
    return '';
  }
}

// Helper to parse email body from Gmail payload parts
function extractBody(payload: any): string {
  if (!payload) return '';

  if (payload.body?.data) {
    const decoded = decodeBase64Url(payload.body.data);
    // If text/html, strip tags or return clean text
    if (payload.mimeType === 'text/html') {
      const doc = new DOMParser().parseFromString(decoded, 'text/html');
      return doc.body.textContent || doc.body.innerText || decoded;
    }
    return decoded;
  }

  if (payload.parts && Array.isArray(payload.parts)) {
    // Prefer text/plain first, then text/html
    const plainPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
    if (plainPart?.body?.data) {
      return decodeBase64Url(plainPart.body.data);
    }

    const htmlPart = payload.parts.find((p: any) => p.mimeType === 'text/html');
    if (htmlPart?.body?.data) {
      const decoded = decodeBase64Url(htmlPart.body.data);
      const doc = new DOMParser().parseFromString(decoded, 'text/html');
      return doc.body.textContent || doc.body.innerText || decoded;
    }

    // Recursively check nested parts (e.g. multipart/alternative)
    for (const part of payload.parts) {
      const text = extractBody(part);
      if (text) return text;
    }
  }

  return '';
}

// Parse sender "Name <email@domain>"
function parseSender(fromHeader: string): { name: string; email: string; initials: string; color: string } {
  if (!fromHeader) {
    return { name: 'Неизвестный', email: '', initials: '?', color: 'bg-slate-600' };
  }

  let name = fromHeader;
  let email = fromHeader;

  const match = fromHeader.match(/^(.*?)\s*<(.+?)>$/);
  if (match) {
    name = match[1].replace(/^["']|["']$/g, '').trim() || match[2];
    email = match[2].trim();
  } else {
    name = fromHeader.split('@')[0];
  }

  const parts = name.split(/\s+/).filter(Boolean);
  let initials = 'U';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (parts.length === 1 && parts[0].length > 0) {
    initials = parts[0].slice(0, 2).toUpperCase();
  }

  const colors = [
    'bg-indigo-600',
    'bg-blue-600',
    'bg-emerald-600',
    'bg-violet-600',
    'bg-rose-600',
    'bg-amber-600',
    'bg-teal-600',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = colors[Math.abs(hash) % colors.length];

  return { name, email, initials, color };
}

// Extract attachments list
function extractAttachments(payload: any): EmailAttachment[] {
  const list: EmailAttachment[] = [];
  if (!payload) return list;

  const inspectParts = (parts: any[]) => {
    for (const part of parts) {
      if (part.filename && part.filename.length > 0) {
        const sizeBytes = part.body?.size || 0;
        const sizeFormatted =
          sizeBytes > 1024 * 1024
            ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} МБ`
            : `${Math.round(sizeBytes / 1024)} КБ`;
        list.push({
          id: part.body?.attachmentId || `att-${list.length + 1}`,
          name: part.filename,
          size: sizeFormatted,
          type: part.mimeType || 'file',
        });
      }
      if (part.parts && Array.isArray(part.parts)) {
        inspectParts(part.parts);
      }
    }
  };

  if (payload.parts && Array.isArray(payload.parts)) {
    inspectParts(payload.parts);
  }
  return list;
}

export async function fetchRealEmails(
  accessToken: string,
  folder: EmailFolder = 'inbox'
): Promise<Email[]> {
  let url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25';

  if (folder === 'inbox') {
    url += '&labelIds=INBOX';
  } else if (folder === 'starred') {
    url += '&labelIds=STARRED';
  } else if (folder === 'sent') {
    url += '&labelIds=SENT';
  } else if (folder === 'drafts') {
    url += '&labelIds=DRAFT';
  } else if (folder === 'trash') {
    url += '&labelIds=TRASH';
  } else if (folder === 'archive') {
    url += '&q=-in:inbox+-in:trash+-in:spam';
  }

  const listRes = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!listRes.ok) {
    const errorText = await listRes.text();
    throw new Error(`Gmail API Error (${listRes.status}): ${errorText}`);
  }

  const listData = await listRes.json();
  const messagesList = listData.messages || [];
  if (messagesList.length === 0) {
    return [];
  }

  // Fetch individual message details in parallel
  const detailPromises = messagesList.map((m: { id: string }) =>
    fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .catch((err) => {
        console.warn(`Failed to fetch message ${m.id}`, err);
        return null;
      })
  );

  const rawMessages = await Promise.all(detailPromises);
  const parsedEmails: Email[] = [];

  for (const raw of rawMessages) {
    if (!raw || !raw.payload) continue;

    const headers = raw.payload.headers || [];
    const getHeader = (name: string) => {
      const h = headers.find((item: any) => item.name.toLowerCase() === name.toLowerCase());
      return h ? h.value : '';
    };

    const fromVal = getHeader('From');
    const toVal = getHeader('To');
    const subjectVal = getHeader('Subject') || '(Без темы)';
    const dateVal = getHeader('Date');

    const sender = parseSender(fromVal);
    const labelIds: string[] = raw.labelIds || [];

    const isRead = !labelIds.includes('UNREAD');
    const isStarred = labelIds.includes('STARRED');

    let resolvedFolder: EmailFolder = 'inbox';
    if (labelIds.includes('TRASH')) resolvedFolder = 'trash';
    else if (labelIds.includes('DRAFT')) resolvedFolder = 'drafts';
    else if (labelIds.includes('SENT')) resolvedFolder = 'sent';
    else if (labelIds.includes('STARRED') && !labelIds.includes('INBOX')) resolvedFolder = 'starred';
    else if (!labelIds.includes('INBOX')) resolvedFolder = 'archive';

    // Format display date
    const timestamp = raw.internalDate ? parseInt(raw.internalDate, 10) : (dateVal ? new Date(dateVal).getTime() : Date.now());
    const dateObj = new Date(timestamp);
    const today = new Date();
    const isToday =
      dateObj.getDate() === today.getDate() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getFullYear() === today.getFullYear();

    const dateDisplay = isToday
      ? 'Сегодня'
      : dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });

    const timeDisplay = dateObj.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

    const bodyText = extractBody(raw.payload) || raw.snippet || '';
    const attachments = extractAttachments(raw.payload);

    // Extract tags from custom labels
    const customLabels = labelIds
      .filter((l) => !['INBOX', 'UNREAD', 'STARRED', 'IMPORTANT', 'SENT', 'DRAFT', 'TRASH', 'SPAM', 'CATEGORY_PERSONAL'].includes(l))
      .map((l) => l.replace(/^CATEGORY_/, ''));

    parsedEmails.push({
      id: raw.id,
      sender,
      to: [toVal || 'me'],
      subject: subjectVal,
      snippet: raw.snippet || bodyText.slice(0, 100),
      body: bodyText,
      date: dateDisplay,
      time: timeDisplay,
      timestamp,
      folder: resolvedFolder,
      labels: customLabels,
      isRead,
      isStarred,
      attachments: attachments.length > 0 ? attachments : undefined,
    });
  }

  return parsedEmails;
}

// Modify message labels (e.g. mark read, archive, star)
export async function modifyGmailLabels(
  accessToken: string,
  messageId: string,
  addLabelIds: string[] = [],
  removeLabelIds: string[] = []
): Promise<void> {
  const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/modify`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      addLabelIds,
      removeLabelIds,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update message: ${errorText}`);
  }
}

// Send real email via Gmail API
export async function sendRealGmailMessage(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<{ id: string }> {
  // UTF-8 subject encoding in RFC 2047: =?utf-8?B?...?=
  const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;

  const rawMessage = [
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');

  // Convert raw RFC 2822 to base64url
  const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encodedMessage }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to send email: ${errText}`);
  }

  return await res.json();
}
