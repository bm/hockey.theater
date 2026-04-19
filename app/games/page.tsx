import { redirect } from "next/navigation";
import { todayDate } from "@/lib/dates";

export default function GamesRoot() {
  redirect(`/games/${todayDate()}`);
}
