import { themes } from "@/utils/constants";
import { init } from "@/utils/phaser";
import { useCallback, useEffect, useRef } from "react";

export const usePhaser = (theme) => {
  const game = useRef(null);

  useEffect(() => {
    game.current?.scene?.keys.game?.enablePipeline(theme === themes.LIGHT);
  }, [theme]);

  useEffect(() => () => game.current?.destroy(true), []);

  const initPhaser = useCallback((initTheme) => {
    if (game.current) return;
    game.current = init(initTheme);
  }, []);

  return { game, initPhaser };
};

export default usePhaser;
