import classes from "./Avatar.module.css";

const Avatar = () => {
  return (
    <div className="me-container">
      {
        <img
          className={classes.Me}
          alt="Me"
          src={`${import.meta.env.VITE_SB_CDN_URL}/images/me.webp`}
        />
      }
    </div>
  );
};

export default Avatar;
