import mfJson from "../../../data/snapshots/amfi-120716.json";
import fdJson from "../../../data/snapshots/sbi-published-card-rate-fd-1y.json";
import { createSnapshotAdapter, SnapshotFile } from "./snapshot";

export const committedSnapshots = [SnapshotFile.parse(fdJson), SnapshotFile.parse(mfJson)];
export const committedMarketData = createSnapshotAdapter(committedSnapshots);
