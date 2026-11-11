import multer from "multer";
import { tmpdir } from "os";
import { MulterStorageEnum } from "../../enums/multer.enum.js";

export const uploadFile = ({
  storageKey = MulterStorageEnum.memoryStorage,
}: {
  storageKey?: MulterStorageEnum;
}) => {
  const storage =
    storageKey === MulterStorageEnum.memoryStorage
      ? multer.memoryStorage()
      : multer.diskStorage({
          destination: function (req, file, cb) {
            cb(null, tmpdir());
          },

          filename: function (req, file, cb) {
            const fileName = Date.now() + "-" + file.originalname;
            cb(null, fileName);
          },
        });

  return multer({ storage });
};
