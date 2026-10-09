import { EditContentView } from '@/components/portal/ContentViews';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditContentView kind="service" id={id} />;
}
