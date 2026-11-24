import "./style.css";
import { inspect } from "./inspect";
import { reveal } from "./reveal";
import { slowNetwork } from "./slow-network";

const title = document.querySelector<HTMLElement>("[data-title]")!;
const slowed = await slowNetwork();

inspect(title, slowed);
reveal(title);
