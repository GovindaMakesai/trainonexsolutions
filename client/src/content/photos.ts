function unsplash(id: string, width = 1600) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;
}

export const photos = {
  team: unsplash('photo-1522071820081-009f0129c71c'),
  desk: unsplash('photo-1498050108023-c5249f4df085', 1200),
  color: unsplash('photo-1579546929518-9e396f3cc809'),
  notes: unsplash('photo-1558655146-d09347e92766', 1000),
  meeting: unsplash('photo-1600880292203-757bb62b4baf', 1400),
  abstract: unsplash('photo-1618005182384-a83a8bd57fbe', 1400),
  phone: unsplash('photo-1512941937669-90a1b58e7e9c', 1000),
  office: unsplash('photo-1497215728101-856f4ea42174', 1400),
  paint: unsplash('photo-1541701494587-cb58502866ab', 1000),
  hands: unsplash('photo-1552664730-d307ca884978', 1000),
};
