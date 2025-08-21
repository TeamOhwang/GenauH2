export type RegionPriceDTO = {
  id: number;
  stationName: string;
  address: string;
  region: string;     // 코드 또는 이름
  price: number;
  vehicleType: string;
  lat?: number;
  lng?: number;
};