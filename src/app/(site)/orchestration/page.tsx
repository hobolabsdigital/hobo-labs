import { Orchestration } from '@/features/site/components/Orchestration';
import { SiteShell } from '@/features/site/components/SiteShell';
import { sheet } from '@/features/site/content';
import { sheetMetadata } from '@/features/site/metadata';

const SHEET = sheet('/orchestration');

export const metadata = sheetMetadata(SHEET);

export default function OrchestrationPage() {
  return (
    <SiteShell sheet={SHEET}>
      <Orchestration />
    </SiteShell>
  );
}
