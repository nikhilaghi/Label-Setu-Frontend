import { apiFetch } from "./api";

export async function uploadInspection(file) {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch("/api/inspections", {
    method: "POST",
    body: formData,
  });
}

export async function getInspectionStatus(inspectionId) {
  return apiFetch(`/api/inspections/${inspectionId}/status`);
}

export async function getInspection(inspectionId) {
  return apiFetch(`/api/inspections/${inspectionId}`);
}

export async function getInspections() {
  return apiFetch("/api/inspections");
}