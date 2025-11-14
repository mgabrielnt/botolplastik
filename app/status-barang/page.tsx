import { getStatusRows } from "@/lib/statusData";
import StatusBarangTable from "@/components/status/StatusBarangTable";

export const dynamic = "force-dynamic";

export default async function StatusBarangPage() {
  const rows = await getStatusRows();

  return <StatusBarangTable initialRows={rows} />;
}
