import { Nutrons } from '@/features/site/components/Nutrons';
import { SiteShell } from '@/features/site/components/SiteShell';
import { sheet } from '@/features/site/content';
import { sheetMetadata } from '@/features/site/metadata';

const SHEET = sheet('/work/nutrons');

export const metadata = sheetMetadata(SHEET);

export default function NutronsPage() {
  return (
    <SiteShell sheet={SHEET}>
      <Nutrons />
    </SiteShell>
  );
}
