import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { SimpleDashboard } from "@/components/SimpleDashboard";
import { apiService } from "@/lib/api";

export function DashboardFlow() {
  const location = useLocation();
  const navigate = useNavigate();

  const { data: status, isLoading } = useQuery({
    queryKey: ["dataStatus"],
    queryFn: () => apiService.getDataStatus(),
    retry: 1,
  });

  useEffect(() => {
    if (isLoading || !status) return;

    const onUploadPage =
      location.pathname.endsWith("/upload") ||
      location.pathname.includes("/dashboard/upload");

    if (!status.has_data && !onUploadPage) {
      navigate("/dashboard/upload", { replace: true });
    }
  }, [status, isLoading, location.pathname, navigate]);

  return <SimpleDashboard />;
}
