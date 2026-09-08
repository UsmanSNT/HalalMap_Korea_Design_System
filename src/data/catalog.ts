// Preserved Figma fixtures. Replace the catalog service when backend endpoints are available.
export const restaurants = [
  { name: "신당 할랄 키친", imageId: "1498654896293-37c98e7f5fe4", badge: "certified" as const, rating: 4.8, count: 3241, distance: "2.3km", eta: "25-35분", fee: "₩2,000", cuisine: "한식" },
  { name: "우즈베키스탄 플로프 하우스", imageId: "1565557623262-b51ff2a27b73", badge: "owned" as const, rating: 4.7, count: 892, distance: "3.1km", eta: "30-40분", fee: "₩1,500", cuisine: "우즈베크" },
  { name: "이스탄불 케밥 & 피데", imageId: "1529042410759-befb1204b468", badge: "certified" as const, rating: 4.5, count: 2110, distance: "0.8km", eta: "20-30분", fee: "무료", cuisine: "터키" },
  { name: "델리 스파이스 하우스", imageId: "1617196034183-421b4040d6fd", badge: "friendly" as const, rating: 4.3, count: 654, distance: "4.2km", eta: "40-50분", fee: "₩2,500", cuisine: "인도" },
  { name: "자카르타 나시고렝", imageId: "1414235077428-338989a2e8c0", badge: "certified" as const, rating: 4.6, count: 1345, distance: "2.8km", eta: "35-45분", fee: "₩2,000", cuisine: "인도네시아" },
  {"name":"이태원 케밥 하우스","imageId":"1529042410759-befb1204b468","badge":"certified" as const,"rating":4.6,"count":1820,"distance":"0.8km","eta":"15–25분","fee":"무료","cuisine":"터키"},
  {"name":"마스지드 서울 카페","imageId":"1414235077428-338989a2e8c0","badge":"owned" as const,"rating":4.9,"count":947,"distance":"1.1km","eta":"20–30분","fee":"무료","cuisine":"카페"},
  {"name":"우즈베키스탄 플로프","imageId":"1565557623262-b51ff2a27b73","badge":"certified" as const,"rating":4.7,"count":612,"distance":"3.1km","eta":"30–40분","fee":"₩1,500","cuisine":"우즈베크"},
  {"name":"델리 스파이스 코리아","imageId":"1414235077428-338989a2e8c0","badge":"friendly" as const,"rating":4.3,"count":389,"distance":"4.2km","eta":"35–45분","fee":"₩2,500","cuisine":"인도"},
];
export const menuItems = [
  { name: "할랄 갈비탕", desc: "사골 육수 12시간 우린 국물", price: 13500, imageId: "1569050467447-ce54b3bbc37d", tags: ["No Pork", "No Alcohol"], popular: true },
  { name: "비빔밥 (할랄)", desc: "신선 야채 + 할랄 소고기", price: 11000, imageId: "1583394293214-b483ffd7e3f7", tags: ["Halal Beef"], popular: true },
  { name: "된장찌개 세트", desc: "전통 된장, 두부, 야채, 밥 포함", price: 12000, imageId: "1617196034183-421b4040d6fd", tags: ["Vegetable"], popular: false },
  { name: "할랄 삼계탕", desc: "국산 닭, 인삼, 찹쌀 들어간 보양식", price: 16500, imageId: "1498654896293-37c98e7f5fe4", tags: ["Halal Chicken"], popular: true },
];
