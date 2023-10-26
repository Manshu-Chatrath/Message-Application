import * as AWS from "aws-sdk";
import express, { Request, Response } from "express";
import { v1 as uuid } from "uuid";
import { DataBaseConnectionError } from "../errors/database-connection-error";
import { isAuth, user } from "../middlewares/isauth";
import User from "../models/user";
import { key } from "../../config/key";
const router = express.Router();

interface Image {
  src: string;
}

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: key.awsAccessKey,
    secretAccessKey: key.awsSecretKey,
  },
  region: "ca-central-1",
});

const getSignedUrl = (imageKey: string, res: Response) => {
  s3.getSignedUrl(
    "putObject",
    {
      Bucket: key.awsBucketName,
      Key: imageKey,
      ContentType: "image/*",
      Expires: 360000,
    },
    (err: Error, url: string) => {
      if (err) {
        return res.status(500).send({ message: "Some error occured!" });
      }
      return res.send({ imageKey, url });
    }
  );
};

router.get(
  "/user-service/upload",
  isAuth,
  async (req: Request, res: Response) => {
    const imageUuid = uuid();
    const imageKey = `${user.id}/${imageUuid}`;
    let obj = { imageUuid: imageUuid };
    const imageId = req.query.imageUuid;
    try {
      await User.update(obj, { where: { id: user.id } });
      if (imageId) {
        s3.deleteObject(
          {
            Bucket: key.awsBucketName,
            Key: `${user.id}/${imageId}`,
          },
          function (err: Error, data) {
            if (err) {
              return res.status(500).send({ message: "Some error occured!" });
            }
            getSignedUrl(imageKey, res);
          }
        );
      } else {
        getSignedUrl(imageKey, res);
      }
    } catch (err) {
      const dataBaseConnectionError = new DataBaseConnectionError(
        "Some Unexpected Error Occured!"
      );
      return res
        .status(dataBaseConnectionError.statusCode)
        .send({ message: dataBaseConnectionError.message });
    }
  }
);

router.post(
  "/user-service/upload",
  isAuth,
  async (req: Request, res: Response) => {
    const { url } = req.body;
    const imageUrl = `https://${key.awsBucketName}.s3.ca-central-1.amazonaws.com/${url}`;

    try {
      let obj: Image = { src: imageUrl };
      const updatedUser = await User.update(obj, { where: { id: user.id } });
      return res.send({ updatedUser });
    } catch (err) {
      const dataBaseConnectionError = new DataBaseConnectionError(
        "Some Unexpected Error Occured!"
      );
      return res
        .status(dataBaseConnectionError.statusCode)
        .send({ message: dataBaseConnectionError.message });
    }
  }
);

export { router as uploadRouter };
