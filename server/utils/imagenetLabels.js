import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imagenetPath = path.resolve(__dirname, "../../model/scripts/imagenet.json");

const normalizeLabel = (value = "") =>
  value
    .toLowerCase()
    .replace(/['.]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const prettifyLabel = (value = "") => value.replace(/_/g, " ");

const IMAGENET_VI_LABELS = {
  remote_control: "Điều khiển từ xa",
  computer_keyboard: "Bàn phím máy tính",
  desktop_computer: "Máy tính để bàn",
  laptop: "Laptop",
  notebook: "Máy tính xách tay dạng notebook",
  cellular_telephone: "Điện thoại di động dạng cellular",
  cellphone: "Điện thoại cầm tay",
  mobile_phone: "Điện thoại di động",
  modem: "Bộ modem",
  monitor: "Màn hình",
  printer: "Máy in",
  radio: "Máy radio",
  television: "Tivi",
  cassette_player: "Máy phát cassette",
  cd_player: "Máy phát CD",
  tape_player: "Máy phát băng",
  ipod: "Máy nghe nhạc iPod",
  microphone: "Micro",
  loudspeaker: "Loa",
  joystick: "Cần điều khiển",
  mouse: "Chuột máy tính",
  screen: "Màn chiếu",
  digital_clock: "Đồng hồ điện tử",
  digital_watch: "Đồng hồ điện tử đeo tay",
  analog_clock: "Đồng hồ kim",
  wall_clock: "Đồng hồ treo tường",
  stopwatch: "Đồng hồ bấm giờ",
  refrigerator: "Tủ lạnh",
  microwave: "Lò vi sóng",
  oven: "Lò nướng",
  toaster: "Máy nướng bánh mì",
  dishwasher: "Máy rửa bát",
  washing_machine: "Máy giặt",
  vacuum: "Máy hút bụi",
  electric_fan: "Quạt điện",
  lamp: "Đèn",
  desk: "Bàn làm việc",
  dining_table: "Bàn ăn",
  chair: "Ghế",
  folding_chair: "Ghế gấp",
  rocking_chair: "Ghế bập bênh",
  sofa: "Ghế sofa",
  couch: "Ghế dài couch",
  bed: "Giường",
  crib: "Cũi trẻ em",
  wardrobe: "Tủ quần áo",
  bookcase: "Tủ sách",
  medicine_chest: "Tủ thuốc",
  safe: "Két sắt",
  backpack: "Ba lô",
  purse: "Túi xách",
  wallet: "Ví",
  umbrella: "Ô",
  sunglass: "Một tròng kính râm",
  sunglasses: "Kính râm",
  bow_tie: "Nơ cổ",
  necktie: "Cà vạt",
  suit: "Bộ vest",
  running_shoe: "Giày chạy bộ",
  cowboy_boot: "Ủng cao bồi",
  sandal: "Dép xăng đan",
  clog: "Guốc",
  bottlecap: "Nắp chai",
  beer_bottle: "Chai bia",
  pop_bottle: "Chai nước ngọt",
  water_bottle: "Chai nước",
  wine_bottle: "Chai rượu vang",
  coffee_mug: "Cốc cà phê",
  cup: "Cốc",
  plate: "Đĩa",
  tray: "Khay",
  spoon: "Thìa",
  ladle: "Muôi",
  spatula: "Xẻng nấu ăn",
  frying_pan: "Chảo rán",
  wok: "Chảo wok",
  teapot: "Ấm trà",
  coffeepot: "Ấm cà phê",
  espresso_maker: "Máy pha espresso",
  blender: "Máy xay sinh tố",
  can_opener: "Dụng cụ mở hộp",
  corkscrew: "Dụng cụ mở nút chai",
  cleaver: "Dao chặt thịt",
  knife: "Dao",
  hammer: "Búa",
  screwdriver: "Tua vít",
  power_drill: "Máy khoan điện",
  chain_saw: "Máy cưa xích",
  lawn_mower: "Máy cắt cỏ",
  padlock: "Ổ khóa",
  combination_lock: "Khóa số",
  key: "Chìa khóa",
  whistle: "Còi",
  ballpoint: "Bút bi",
  fountain_pen: "Bút máy",
  pencil_box: "Hộp bút",
  eraser: "Tẩy",
  rubber_eraser: "Tẩy bút chì",
  book_jacket: "Bìa sách",
  envelope: "Phong bì",
  binder: "Bìa hồ sơ",
  file: "Tủ hồ sơ",
  ruler: "Thước kẻ",
  paintbrush: "Cọ vẽ",
  palette: "Bảng pha màu",
  camera: "Máy ảnh",
  reflex_camera: "Máy ảnh phản xạ",
  binoculars: "Ống nhòm",
  telescope: "Kính thiên văn",
  projector: "Máy chiếu",
  traffic_light: "Đèn giao thông",
  street_sign: "Biển báo đường phố",
  parking_meter: "Đồng hồ đỗ xe",
  fire_engine: "Xe cứu hỏa",
  ambulance: "Xe cứu thương",
  police_van: "Xe cảnh sát",
  taxi: "Taxi",
  jeep: "Xe jeep",
  limousine: "Xe limousine",
  minivan: "Xe minivan",
  sports_car: "Xe thể thao",
  convertible: "Xe mui trần",
  racer: "Xe đua",
  pickup: "Xe bán tải",
  tow_truck: "Xe kéo",
  trailer_truck: "Xe đầu kéo",
  garbage_truck: "Xe chở rác",
  bus: "Xe buýt",
  school_bus: "Xe buýt trường học",
  trolleybus: "Xe buýt điện",
  bicycle: "Xe đạp",
  mountain_bike: "Xe đạp địa hình",
  motor_scooter: "Xe tay ga",
  motorcycle: "Xe máy",
  unicycle: "Xe đạp một bánh",
  airliner: "Máy bay chở khách",
  airship: "Khinh khí cầu",
  warplane: "Máy bay quân sự",
  helicopter: "Trực thăng",
  speedboat: "Xuồng cao tốc",
  lifeboat: "Xuồng cứu sinh",
  canoe: "Ca nô",
  gondola: "Thuyền gondola",
  container_ship: "Tàu container",
  pirate: "Tàu cướp biển",
  submarine: "Tàu ngầm",
  steam_locomotive: "Đầu máy hơi nước",
  electric_locomotive: "Đầu máy điện",
  soccer_ball: "Bóng đá",
  basketball: "Bóng rổ",
  volleyball: "Bóng chuyền",
  tennis_ball: "Bóng tennis",
  golf_ball: "Bóng golf",
  rugby_ball: "Bóng bầu dục",
  ping_pong_ball: "Bóng bàn",
  baseball: "Bóng chày",
  punching_bag: "Bao cát đấm bốc",
  dumbbell: "Tạ tay",
  barbell: "Tạ đòn",
  racket: "Vợt",
  ski: "Ván trượt ski",
  snowboard: "Ván trượt snowboard",
  swimsuit: "Đồ bơi",
  swimming_trunks: "Quần bơi",
};

const buildImagenetIndex = () => {
  try {
    const raw = JSON.parse(fs.readFileSync(imagenetPath, "utf8"));

    return Object.values(raw).reduce((index, value) => {
      const aliases = value.split(",").map((item) => item.trim()).filter(Boolean);
      const primary = aliases[0] || "";
      const primaryKey = normalizeLabel(primary);
      const entry = {
        label: primaryKey,
        englishName: primary,
        vietnameseName: IMAGENET_VI_LABELS[primaryKey] || "",
      };

      aliases.forEach((alias) => {
        index[normalizeLabel(alias)] = entry;
      });
      return index;
    }, {});
  } catch (error) {
    console.warn("Could not load ImageNet labels:", error.message);
    return {};
  }
};

const imagenetIndex = buildImagenetIndex();

export const getImagenetFallbackLabel = (label) => {
  const normalized = normalizeLabel(label);
  const entry = imagenetIndex[normalized];
  const vietnameseName = IMAGENET_VI_LABELS[normalized] || entry?.vietnameseName;

  if (!entry && !vietnameseName) {
    return {
      label,
      englishName: prettifyLabel(label),
      vietnameseName: prettifyLabel(label),
    };
  }

  return {
    label: entry?.label || normalized,
    englishName: entry?.englishName || prettifyLabel(label),
    vietnameseName: vietnameseName || prettifyLabel(entry?.englishName || label),
  };
};
