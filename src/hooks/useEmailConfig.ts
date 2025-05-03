
import { useEmailConfig } from './email/useEmailConfig';
// Change from "export { EmailConfig }" to "export type { EmailConfig }"
export type { EmailConfig } from './email/types';

export { useEmailConfig };
