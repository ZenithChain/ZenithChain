import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statsRouter from "./stats";
import userRouter from "./user";
import missionsRouter from "./missions";
import faucetRouter from "./faucet";
import checkinRouter from "./checkin";
import boxesRouter from "./boxes";
import leaderboardRouter from "./leaderboard";
import referralsRouter from "./referrals";
import activityRouter from "./activity";
import explorerRouter from "./explorer";
import badgesRouter from "./badges";

const router: IRouter = Router();

router.use(healthRouter);
router.use(statsRouter);
router.use(userRouter);
router.use(missionsRouter);
router.use(faucetRouter);
router.use(checkinRouter);
router.use(boxesRouter);
router.use(leaderboardRouter);
router.use(referralsRouter);
router.use(activityRouter);
router.use(explorerRouter);
router.use(badgesRouter);

export default router;
