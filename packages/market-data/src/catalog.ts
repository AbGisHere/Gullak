import mfJson from "../../../data/snapshots/amfi-120716.json";
import niftyJson from "../../../data/snapshots/nse-indices-nifty-50.json";
import fdJson from "../../../data/snapshots/sbi-published-card-rate-fd-1y.json";
import { createSnapshotAdapter, SnapshotFile } from "./snapshot";

export const committedSnapshots = [
  SnapshotFile.parse(fdJson),
  SnapshotFile.parse(mfJson),
  SnapshotFile.parse(niftyJson),
];
export const committedMarketData = createSnapshotAdapter(committedSnapshots);
