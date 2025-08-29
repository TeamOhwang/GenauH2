// // stores/useFacilityStore.ts
// import { create } from "zustand";
// import type { Facility } from "@/domain/graph/facility";

// type FacilityState = {
//   facilities: Facility[];
//   setFacilities: (list: Facility[]) => void;
//   clear: () => void;
// };

// export const useFacilityStore = create<FacilityState>((set) => ({
//   facilities: [],
//   setFacilities: (list) => set({ facilities: list }),
//   clear: () => set({ facilities: [] }),
// }));
