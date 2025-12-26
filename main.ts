enum ActionKind {
    Walking,
    Idle,
    Jumping
}
function handlePlayerMovement () {
    playerRobot.ay = gravity
    if (controller.B.isPressed() && playerRobot.isHittingTile(CollisionDirection.Bottom)) {
        playerRobot.vy = jumpPower
    }
    // Apply motion based on left right button being pressed, move faster when going in the opposite direction for quick turn around
    if (controller.dx() / Math.abs(controller.dx()) != playerRobot.vx / Math.abs(playerRobot.vx)) {
        playerRobot.vx += controller.dx() * (speedScalar * 5)
    } else {
        playerRobot.vx += controller.dx() * speedScalar
    }
    // Apply linear damping to slow down player
    if (Math.abs(playerRobot.vx) > maxSpeed || !(controller.anyButton.isPressed())) {
        if (playerRobot.vx > 0) {
            playerRobot.vx = Math.max(playerRobot.vx - linearDamping, 0)
        } else if (playerRobot.vx < 0) {
            playerRobot.vx = Math.min(playerRobot.vx + linearDamping, 0)
        } else {
        	
        }
    }
}
function assemblePlayerAnims (mySprite: Sprite) {
    customUtils.setDataImageArray(mySprite, "playerIdleRight", [
    assets.image`orange_robot_idle_1`,
    assets.image`orange_robot_idle_2`,
    assets.image`orange_robot_idle_3`,
    assets.image`orange_robot_idle_4`,
    assets.image`orange_robot_idle_5`
    ])
    customUtils.setDataImageArray(mySprite, "playerIdleLeft", [
    assets.image`orange_robot_idleleft_1`,
    assets.image`orange_robot_idleleft_2`,
    assets.image`orange_robot_idleleft_3`,
    assets.image`orange_robot_idleleft_4`,
    assets.image`orange_robot_idleleft_5`
    ])
    customUtils.setDataImageArray(mySprite, "playerRunRight", [
    assets.image`orange_robot_runright_1`,
    assets.image`orange_robot_runright_2`,
    assets.image`orange_robot_runright_3`,
    assets.image`orange_robot_runright_4`,
    assets.image`orange_robot_runright_5`,
    assets.image`orange_robot_runright_6`
    ])
    customUtils.setDataImageArray(mySprite, "playerRunLeft", [
    assets.image`orange_robot_runleft_1`,
    assets.image`orange_robot_runleft_2`,
    assets.image`orange_robot_runleft_3`,
    assets.image`orange_robot_runleft_4`,
    assets.image`orange_robot_runleft_5`,
    assets.image`orange_robot_runleft_6`
    ])
    customUtils.setDataImageArray(mySprite, "playerJumpRight", [
    assets.image`orange_robot_jump_1`,
    assets.image`orange_robot_jump_2`,
    assets.image`orange_robot_jump_3`,
    assets.image`orange_robot_jump_4`,
    assets.image`orange_robot_jump_5`
    ])
    customUtils.setDataImageArray(mySprite, "playerJumpLeft", [
    assets.image`orange_robot_jumpleft_1`,
    assets.image`orange_robot_jumpleft_2`,
    assets.image`orange_robot_jumpleft_3`,
    assets.image`orange_robot_jumpleft_4`,
    assets.image`orange_robot_jumpleft_5`
    ])
    customUtils.setDataImageArray(mySprite, "playerLandRight", [assets.image`orange_robot_land_1`, assets.image`orange_robot_land_2`, assets.image`orange_robot_land_3`])
    customUtils.setDataImageArray(mySprite, "playerLandLeft", [assets.image`orange_robot_landleft_1`, assets.image`orange_robot_landleft_2`, assets.image`orange_robot_landleft_3`])
    customUtils.setDataImageArray(mySprite, "playerAttackRight1", [
    assets.image`orange_robot_attackright1_1`,
    assets.image`orange_robot_attackright1_2`,
    assets.image`orange_robot_attackright1_3`,
    assets.image`orange_robot_attackright1_4`
    ])
    customUtils.setDataImageArray(mySprite, "playerAttackLeft1", [
    assets.image`orange_robot_attackleft1_1`,
    assets.image`orange_robot_attackleft1_2`,
    assets.image`orange_robot_attackleft1_3`,
    assets.image`orange_robot_attackleft1_4`
    ])
    customUtils.setDataImageArray(mySprite, "playerAttackRight2", [
    assets.image`orange_robot_attackright2_1`,
    assets.image`orange_robot_attackright2_2`,
    assets.image`orange_robot_attackright2_3`,
    assets.image`orange_robot_attackright2_4`
    ])
    customUtils.setDataImageArray(mySprite, "playerAttackLeft2", [
    assets.image`orange_robot_attackleft2_1`,
    assets.image`orange_robot_attackleft2_2`,
    assets.image`orange_robot_attackleft2_3`,
    assets.image`orange_robot_attackleft2_4`
    ])
    customUtils.setDataImageArray(mySprite, "playerHurtRight", [assets.image`orange_robot_hurt_1`, assets.image`orange_robot_hurt_2`])
    customUtils.setDataImageArray(mySprite, "playerHurtLeft", [assets.image`orange_robot_hurtleft_1`, assets.image`orange_robot_hurtleft_2`])
    customUtils.setDataImageArray(mySprite, "playerDeathRight", [
    assets.image`orange_robot_death_1`,
    assets.image`orange_robot_death_2`,
    assets.image`orange_robot_death_3`,
    assets.image`orange_robot_death_4`
    ])
    customUtils.setDataImageArray(mySprite, "playerDeathLeft", [
    assets.image`orange_robot_deathleft_1`,
    assets.image`orange_robot_deathleft_2`,
    assets.image`orange_robot_deathleft_3`,
    assets.image`orange_robot_deathleft_4`
    ])
}
function assignPlayerAnims (mySprite: Sprite) {
    characterAnimations.loopFrames(
    mySprite,
    customUtils.readDataImageArray(mySprite, "playerIdleRight"),
    200,
    characterAnimations.rule(Predicate.NotMoving, Predicate.FacingRight)
    )
    characterAnimations.loopFrames(
    mySprite,
    customUtils.readDataImageArray(mySprite, "playerIdleLeft"),
    200,
    characterAnimations.rule(Predicate.NotMoving, Predicate.FacingLeft)
    )
}
let playerRobot: Sprite = null
let jumpPower = 0
let gravity = 0
let maxSpeed = 0
let speedScalar = 0
let linearDamping = 0
linearDamping = 12
speedScalar = 2
maxSpeed = 100
gravity = 400
jumpPower = -170
tiles.setCurrentTilemap(tilemap`level1`)
playerRobot = sprites.create(assets.image`orange_robot_idle_1`, SpriteKind.Player)
scene.cameraFollowSprite(playerRobot)
assemblePlayerAnims(playerRobot)
assignPlayerAnims(playerRobot)
game.onUpdate(function () {
    handlePlayerMovement()
})
