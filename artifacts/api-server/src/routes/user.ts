import { Router, type IRouter } from "express";
import {
  ConnectWalletBody,
  GetUserParams,
  GetUserResponse,
  ConnectWalletResponse,
} from "@workspace/api-zod";
import { asyncHandler } from "../lib/errors";
import {
  buildUserResponse,
  fetchUserByAddress,
  getOrCreateUser,
  HttpError,
} from "../lib/userService";
import { clientIp } from "../lib/zenith";

const router: IRouter = Router();

router.post(
  "/connect",
  asyncHandler(async (req, res) => {
    const body = ConnectWalletBody.parse(req.body);
    const ip = clientIp(req);
    const { user } = await getOrCreateUser({
      address: body.address,
      ip,
      referralCode: body.referralCode ?? null,
    });
    const response = await buildUserResponse(user);
    res.json(ConnectWalletResponse.parse(response));
  }),
);

router.get(
  "/user/:address",
  asyncHandler(async (req, res) => {
    const params = GetUserParams.parse(req.params);
    const user = await fetchUserByAddress(params.address);
    if (!user) {
      throw new HttpError(404, "User not found", { code: "NOT_FOUND" });
    }
    const response = await buildUserResponse(user);
    res.json(GetUserResponse.parse(response));
  }),
);

export default router;
