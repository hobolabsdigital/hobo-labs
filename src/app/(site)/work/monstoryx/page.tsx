import { Monstoryx } from '@/features/site/components/Monstoryx';
import { SiteShell } from '@/features/site/components/SiteShell';
import { sheet } from '@/features/site/content';
import { sheetMetadata } from '@/features/site/metadata';

const SHEET = sheet('/work/monstoryx');

export const metadata = sheetMetadata(SHEET);

export default function MonstoryxPage() {
  return (
    <SiteShell sheet={SHEET}>
      <Monstoryx />
    </SiteShell>
  );
}
