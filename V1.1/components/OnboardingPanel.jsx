import { useState } from "react";
import { useRouter } from "next/router";
import { BadgeCheck, Check, Circle, CircleHelp, CreditCard, ExternalLink, FilePlus2, Smartphone, Target } from "lucide-react";
import { creationFeatures } from "../config/features";
import { trackingHelp } from "../config/onboarding";
import { planGuidance } from "../config/plans";
import { v11Routes } from "../config/routes";
import { Button, Modal } from "./UI";
import styles from "../styles/v11.module.css";
import { useSubscription } from "./SubscriptionModal";

function FeatureHelp({ onClose }) {
  return <Modal title="Which one should I use?" description="Choose the simplest tool for the result you need." onClose={onClose}><div className={styles.helpStack}>{creationFeatures.map(({ id, title, helpDescription, example, Icon, modalClass }) => <article key={id} className={styles[modalClass]}><span><Icon/></span><div><b>{title}</b><p>{helpDescription}</p><small>{example}</small></div></article>)}<aside><b>Still unsure?</b><p>Landing Page is the best starting point for most campaigns.</p></aside></div></Modal>;
}
function PlanHelp({ onClose, openPlans }) {
  return <Modal title="Which plan should I choose?" description="A practical guide based on how actively you use MyTikLink." onClose={onClose} footer={<Button onClick={openPlans}>View plans</Button>}><div className={styles.planHelpList}>{planGuidance.map((plan) => <article key={plan.id}><span>{plan.title === "Pro" && <BadgeCheck/>}</span><div><b>{plan.title}</b><p>{plan.description}</p><small>{plan.limits}</small></div></article>)}</div></Modal>;
}
function PixelHelp({ onClose }) {
  return <Modal title="How do I find my Pixel ID?" description="Connect at least one platform to complete this setup step." onClose={onClose}><div className={styles.pixelHelpList}>{Object.values(trackingHelp).map((item) => <article key={item.title}><Target/><div><b>{item.title}</b><p>{item.description}</p><a href={item.videoUrl} target="_blank" rel="noreferrer">Watch setup guide <ExternalLink/></a></div></article>)}</div></Modal>;
}

export function OnboardingPanel({ user, data, chooseFeature }) {
  const router = useRouter();
  const { openSubscription } = useSubscription();
  const [help, setHelp] = useState(null);
  const hasPhone = Boolean(String(user?.phone || user?.phoneNumber || user?.whatsapp || user?.whatsappNumber || "").replace(/\D/g, "").length >= 7);
  const isPaid = !String(user?.plan || "free").toLowerCase().startsWith("free");
  const hasCreated = Boolean(data.pages.length || data.links.length || data.store);
  const hasPixel = Boolean(user?.tiktokPixelId || user?.metaPixelId);
  const steps = [hasPhone, isPaid, hasCreated, hasPixel];
  const completed = steps.filter(Boolean).length;
  const progress = Math.round((completed / steps.length) * 100);
  const stepIcon = (done) => done ? <Check aria-hidden="true"/> : <Circle aria-hidden="true"/>;
  return <><section className={`${styles.onboardingCard} ${completed === 4 ? styles.onboardingComplete : ""}`}><header><div><span className={styles.eyebrow}>GET STARTED</span><h2>{completed === 4 ? "You’re all set" : "Complete your MyTikLink setup"}</h2><p>{completed} of 4 complete · {progress}%</p></div>{completed === 4 && <BadgeCheck/>}</header><div className={styles.progressTrack} aria-label={`${progress}% setup complete`}><span style={{ width: `${progress}%` }}/></div>{completed < 4 && <div className={styles.onboardingSteps}>
    <article className={hasPhone ? styles.stepDone : ""}><span>{stepIcon(hasPhone)}</span><div><b>Add your phone number</b><small>Required for customer contact and account recovery.</small></div>{!hasPhone && <button onClick={() => router.push("/v1-1/settings/security")}>Add number</button>}</article>
    <article className={isPaid ? styles.stepDone : ""}><span>{stepIcon(isPaid)}</span><div><b>Upgrade to a paid plan</b><button className={styles.helpAction} onClick={() => setHelp("plan")}><CircleHelp/> Which plan should I choose?</button></div>{!isPaid && <button onClick={() => openSubscription({ mode: "upgrade" })}>View plans</button>}</article>
    <article className={hasCreated ? styles.stepDone : ""}><span>{stepIcon(hasCreated)}</span><div><b>Create your first page</b><button className={styles.helpAction} onClick={() => setHelp("feature")}><CircleHelp/> Not sure which one to use?</button>{!hasCreated && <div className={styles.featureChips}>{creationFeatures.map(({ id, title, Icon, action }) => <button key={id} onClick={() => chooseFeature(action)}><Icon/>{title}</button>)}</div>}</div></article>
    <article className={hasPixel ? styles.stepDone : ""}><span>{stepIcon(hasPixel)}</span><div><b>Connect your tracking pixel</b><button className={styles.helpAction} onClick={() => setHelp("pixel")}><CircleHelp/> How do I find my Pixel ID?</button></div>{!hasPixel && <button onClick={() => router.push(v11Routes.tracking)}>Connect</button>}</article>
  </div>}</section>{help === "feature" && <FeatureHelp onClose={() => setHelp(null)}/>} {help === "plan" && <PlanHelp onClose={() => setHelp(null)} openPlans={() => { setHelp(null); openSubscription({ mode: "upgrade" }); }}/>} {help === "pixel" && <PixelHelp onClose={() => setHelp(null)}/>}</>;
}
