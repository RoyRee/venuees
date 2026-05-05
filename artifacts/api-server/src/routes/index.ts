import { Router, type IRouter } from "express";
import healthRouter from "./health";
import venuesRouter from "./venues";
import vendorsRouter from "./vendors";
import getawaysRouter from "./getaways";
import destinationsRouter from "./destinations";
import realWeddingsRouter from "./real-weddings";
import enquiriesRouter from "./enquiries";

const router: IRouter = Router();

router.use(healthRouter);
router.use(venuesRouter);
router.use(vendorsRouter);
router.use(getawaysRouter);
router.use(destinationsRouter);
router.use(realWeddingsRouter);
router.use(enquiriesRouter);

export default router;
