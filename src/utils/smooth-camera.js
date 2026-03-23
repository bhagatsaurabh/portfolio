import { Euler, Quaternion, Vector3 } from "three";
import { Tween } from "./simulation";
import { cubicBezier } from "./graphics";

export class SmoothCamera {
  camera = null;
  tween = new Tween(0, 1, 1.25, cubicBezier(0.33, 0.03, 0.35, 0.97));
  targetPos = null;
  #targetQuat = null;

  get targetRot() {
    return new Euler().setFromQuaternion(this.#targetQuat);
  }
  set targetRot(rotation) {
    const euler = new Euler(rotation.x, rotation.y, rotation.z /* , "YXZ" */);
    this.#targetQuat = new Quaternion().setFromEuler(euler);
  }

  constructor(camera, startPos = new Vector3(0, 0, 0), startRot = new Vector3(0, 0, 0)) {
    this.camera = camera;
    this.reset(startPos, startRot);
  }

  reset(startPos, startRot) {
    this.targetPos = startPos;
    this.targetRot = startRot;
    this.camera.position.set(this.targetPos.x, this.targetPos.y, this.targetPos.z);
    this.camera.quaternion.set(
      this.#targetQuat.x,
      this.#targetQuat.y,
      this.#targetQuat.z,
      this.#targetQuat.w,
    );
  }
  startPos = new Vector3();
  startQuat = new Quaternion();
  update(dt) {
    const distance = this.camera.position.distanceTo(this.targetPos);
    const angle = this.camera.quaternion.angleTo(this.#targetQuat);

    if (!this.tween.running && (Math.abs(distance) > 0.1 || Math.abs(angle) > 0.1)) {
      this.tween.start();
      this.startPos.copy(this.camera.position);
      this.startQuat.copy(this.camera.quaternion);
    }

    if (this.tween.running) {
      const tweenRes = this.tween.update(dt);
      const alpha = tweenRes.value;
      this.camera.position.lerpVectors(this.startPos, this.targetPos, alpha);
      this.camera.quaternion.slerpQuaternions(this.startQuat, this.#targetQuat, alpha);
    }
  }
}
