import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextFunction, Request, Response } from "express";
import { db } from "./database";
import { IUser } from "./types";

class UserController {
  private client: S3Client;

  constructor() {
    this.client = new S3Client({
      region: "ap-south-1",
      credentials: {
        accessKeyId: process.env.ACCESS_KEY_ID || "",
        secretAccessKey: process.env.SECRET_ACCESS_KEY || "",
      },
    });
  }

  async createUser(req: Request, res: Response, next: NextFunction) {
    const { name } = req.body;
    const trx = await db.transaction();
    try {
      const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: req?.file?.originalname,
        Body: req?.file?.buffer,
        ContentType: req?.file?.mimetype,
      };
      const s3Image = await this.client.send(new PutObjectCommand(params));
      if (!s3Image) {
        throw new Error("s3Image not uploaded");
      }
      const [userId] = await db("users").insert({ name });
      const image = await trx("images").insert({
        url: req?.file?.originalname,
        user_id: userId,
      });
      await trx.commit();
      res.send({ image });
    } catch (error) {
      await trx.rollback();
      next(error);
    }
  }

  async getUser(req: Request, res: Response, next: NextFunction) {
    const userId = +(req.query.user_id || 0);
    try {
      const user = await this.getUserWithImages(userId);
      res.send({ user });
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await db("users")
        .select(
          "users.id",
          "users.name",
          db.raw("json_arrayagg(images.url) as images")
        )
        .leftJoin("images", "users.id", "images.user_id")
        .groupBy("users.id");
      if (users && users.length) {
        await Promise.all(
          users.map(async (user: IUser) => {
            if (user.images) {
              const signedUrl = await Promise.all(
                user.images.map(async (image: string) => {
                  const command = new GetObjectCommand({
                    Bucket: "basic-server",
                    Key: image,
                  });
                  return await getSignedUrl(this.client, command, {
                    expiresIn: 3600,
                  });
                })
              );
              user.images = signedUrl;
            }
          })
        );
      }
      res.send({ users });
    } catch (error) {
      next(error);
    }
  }

  private async getUserWithImages(userId: number) {
    const user = await db("users")
      .select(
        "users.id",
        "users.name",
        db.raw("json_arrayagg(images.url) as images")
      )
      .leftJoin("images", "users.id", "images.user_id")
      .groupBy("users.id")
      .where("users.id", userId)
      .first();
    if (user) {
      const command = new GetObjectCommand({
        Bucket: "basic-server",
        Key: user.images[0],
      });
      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 });
      user.url = url;
    }
    return user;
  }
}

export default UserController;
