import { SiteShell } from '@/features/site/components/SiteShell';
import { Work } from '@/features/site/components/Work';
import { sheet } from '@/features/site/content';
import { sheetMetadata } from '@/features/site/metadata';

const SHEET = sheet('/work');

export const metadata = sheetMetadata(SHEET);

export default function WorkPage() {
  return (
    <SiteShell sheet={SHEET}>
      <Work />
    </SiteShell>
  );
}
