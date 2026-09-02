import ImageKit from "@imagekit/nodejs";
import { config } from "./environment";

const imageKit = new ImageKit({
  privateKey: config.IMAGEKIT.privateKey!,
});

export default imageKit;