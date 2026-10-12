import React, { useEffect, useState } from "react";
import { Icon, getIcon, loadIcons } from "@iconify/react";
import { FaHtml5, FaCss3, FaReact, FaFigma, FaGitAlt } from "react-icons/fa";
import { IoLogoJavascript } from "react-icons/io5";
import { SiMui, SiRedux } from "react-icons/si";

export const LOCAL_ICONS = {
  "local:html5": FaHtml5, "local:css3": FaCss3, "local:javascript": IoLogoJavascript,
  "local:react": FaReact, "local:figma": FaFigma, "local:mui": SiMui,
  "local:git": FaGitAlt, "local:redux": SiRedux,
};
const legacyPaths = {
  "react-icons/fa/FaHtml5": "local:html5", "react-icons/fa/FaCss3": "local:css3",
  "react-icons/io5/IoLogoJavascript": "local:javascript", "react-icons/fa/FaReact": "local:react",
  "react-icons/fa/FaFigma": "local:figma", "react-icons/si/SiMui": "local:mui",
  "react-icons/fa/FaGitAlt": "local:git", "react-icons/si/SiRedux": "local:redux",
};
const own = (map, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(map, key);
export const isRemoteIconId = id => typeof id === "string" && id.length <= 160 && !id.startsWith("local:") && /^[a-z0-9]+(?:-[a-z0-9]+)*:[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id);
export const resolveSkillIcon = skill => {
  if (own(LOCAL_ICONS, skill.iconId) || isRemoteIconId(skill.iconId)) return skill.iconId;
  return own(legacyPaths, skill.iconPath) && (skill.iconPackage == null || skill.iconPackage === skill.iconPath.split("/")[1])
    ? legacyPaths[skill.iconPath] : undefined;
};
function RemoteIcon({ id }) {
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => { if (active) setState("unavailable"); }, 8000);
    const cancel = loadIcons([id], (loaded, missing, pending) => {
      if (!active || pending.length) return;
      clearTimeout(timer);
      const icon = getIcon(id);
      setData(icon || null); setState(icon ? "ready" : "unavailable");
    });
    return () => { active = false; clearTimeout(timer); cancel(); };
  }, [id]);
  return <span data-icon-state={state} title={state === "unavailable" ? "Icon unavailable" : undefined}>
    {data ? <Icon icon={data} width={30} height={30} aria-hidden="true" focusable="false" /> : "◇"}
  </span>;
}
export default function SkillIcon({ skill }) {
  const id = resolveSkillIcon(skill);
  const Local = own(LOCAL_ICONS, id) ? LOCAL_ICONS[id] : undefined;
  return <span className="resume-skill-icon" aria-hidden="true">
    {Local ? <Local aria-hidden="true" focusable="false" /> : id ? <RemoteIcon key={id} id={id} /> : <span>◇</span>}
  </span>;
}
