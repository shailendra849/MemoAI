export interface MeetingNote {
  id: string;
  timestamp: string;
  transcript: string;
  summary: string;
  language: string;
  title: string;
  audioBase64?: string;
  userId: string;
  isPublic?: boolean;
}

export type SupportedLanguage = {
  code: string;
  name: string;
};

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
];
