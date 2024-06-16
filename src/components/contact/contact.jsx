import classes from "./contact.module.css";
import Tooltip from "../../components/Common/Tooltip/tooltip";
// import SkillIcon from "../../components/Common/SkillIcon/skill-icon";
// import GlassButton from "../../components/Common/GlassButton/glass-button";
// import resumeIcon from "../../assets/images/resume.png";
import myImage from "@/assets/images/me.png";
import { useSelector } from "react-redux";

const Contact = (props) => {
  const contact = useSelector((state) => state.contact);

  return (
    <div className={classes.Contact}>
      {<img className={classes.Me} alt="Me" src={myImage} />}
      <a className={classes.Email} href={"mailto:" + contact.email}>
        <Tooltip customStyle={{ marginRight: ".5rem" }} tip="E-mail">
          {/* <SkillIcon name="email" /> */}
        </Tooltip>
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
              <Tooltip tip={platform.name}>
                {/* <SkillIcon name={platform.name.toLowerCase()} /> */}
              </Tooltip>
            </a>
          ))}
      </div>
      {/* <GlassButton
        customStyle={{ alignSelf: "unset", marginTop: "1rem" }}
        icon={resumeIcon}
        clicked={() => this.props.history.push("/resume")}
        text="Résumé"
      /> */}
      <div className={classes.Copyright}>
        &copy;&nbsp;{new Date().getFullYear()}&nbsp;Saurabh Bhagat
      </div>
    </div>
  );
};

export default Contact;
