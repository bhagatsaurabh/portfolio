import { useSelector } from "react-redux";

import classes from "./about.module.css";
import myImage from "@/assets/images/me.png";
import Icon from "../common/Icon/icon.jsx";
import FeedButton from "../common/FeedButton/feed-button.jsx";
import { router } from "@/router";

const About = () => {
  const contact = useSelector((state) => state.contact);

  return (
    <div className={classes.About}>
      <h4>
        Over the past 5 years, my journey has taken me through various business
        domains, from Risk Management and Regulatory Compliance to Automation.
      </h4>
      <h4>
        I have enjoyed creating both front-end and back-end systems, enhancing
        productivity with innovative tools, and streamlining workflows with
        DevOps.
      </h4>
      <div className={classes.MeContainer}>
        {<img className={classes.Me} alt="Me" src={myImage} />}
      </div>
      <h4>
        Outside of work, I love the thrill of developing games and composing
        instrumental music.
      </h4>
      <a className={classes.Email} href={"mailto:" + contact.email}>
        <Icon name="email" size={1.5} />
        {contact.email}
      </a>
      <div className={classes.Platforms}>
        {contact.platforms &&
          contact.platforms.map((platform) => (
            <a
              className={classes.PlatformLink}
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
      <span className={classes.Location}>
        <Icon name="pin" size={1} />
        Amsterdam, Nederlands
      </span>
      <div className={classes.Copyright}>
        &copy;&nbsp;{new Date().getFullYear()}&nbsp;Saurabh Bhagat
      </div>
    </div>
  );
};

export default About;
