import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";

import styles from "./about.module.css";
import myImage from "@/assets/images/me.png";
import Icon from "../common/Icon/icon.jsx";
import FeedButton from "../common/FeedButton/feed-button.jsx";
import { router } from "@/router";

const About = () => {
  const contact = useSelector((state) => state.contact);
  const [emailCopied, setEmailCopied] = useState(false);
  const location = useLocation();
  const animated = useRef(false);

  const classes = [styles.About];
  if (location.pathname === "/about" || animated.current) {
    classes.push(styles.animate);
    animated.current = true;
  }

  useEffect(() => {
    let handle = -1;
    if (emailCopied) {
      handle = setTimeout(() => setEmailCopied(false), 3000);
    }
    return () => clearTimeout(handle);
  }, [emailCopied]);

  const handleEmailCopy = () => {
    navigator.clipboard.writeText(contact.email);
    setEmailCopied(true);
  };

  return (
    <div className={classes.join(" ")}>
      <div className={styles.Container}>
        <h4>
          Over the past 5 years, my journey has taken me through various
          business domains, from Risk Management and Regulatory Compliance to
          Automation.
        </h4>
        <h4>
          I have enjoyed creating both front-end and back-end systems, enhancing
          productivity with innovative tools, and streamlining workflows with
          DevOps.
        </h4>
        <div className={styles.MeContainer}>
          {<img className={styles.Me} alt="Me" src={myImage} />}
        </div>
        <h4>
          Outside of work, I love the thrill of developing games and composing
          instrumental music.
        </h4>
        <div
          className={[styles.Email, emailCopied ? styles.copied : ""].join(" ")}
        >
          <a href={"mailto:" + contact.email}>
            <Icon name="email" size={1.5} />
            {contact.email}
          </a>
          <button onClick={() => !emailCopied && handleEmailCopy()}>
            <Icon name="copy" />
            <Icon name="check" />
          </button>
        </div>
        <div className={styles.Platforms}>
          {contact.platforms &&
            contact.platforms.map((platform) => (
              <a
                className={styles.PlatformLink}
                target="_blank"
                rel="noreferrer"
                key={platform.name}
                href={platform.link}
              >
                <Icon name={platform.name.toLowerCase()} size={1.5} />
              </a>
            ))}
        </div>
        <FeedButton
          customStyle={{ alignSelf: "unset", marginTop: "1rem" }}
          icon="resume"
          onClick={() => router.navigate("/resume")}
        >
          {"Résumé"}
        </FeedButton>
        <span className={styles.Location}>
          <Icon name="pin" size={1} />
          Mumbai, India
        </span>
        <span className={styles.Copyright}>
          &copy;&nbsp;{new Date().getFullYear()}&nbsp;Saurabh Bhagat
        </span>
      </div>
    </div>
  );
};

export default About;
