enum ActionKind {
    Walking,
    Idle,
    Jumping
}
namespace SpriteKind {
    export const EndGoal = SpriteKind.create()
}
function handleAttack () {
    attacking = true
    characterAnimations.setCharacterAnimationsEnabled(playerRobot, false)
    if (nextAttack == "right") {
        nextAttack = ""
        if (currAttack == 1) {
            animation.runImageAnimation(
            playerRobot,
            customUtils.readDataImageArray(playerRobot, "playerAttackRight1"),
            100,
            false
            )
            currAttack = 2
        } else {
            animation.runImageAnimation(
            playerRobot,
            customUtils.readDataImageArray(playerRobot, "playerAttackRight2"),
            100,
            false
            )
            currAttack = 1
        }
        animWait = 400
    } else if (nextAttack == "left") {
        nextAttack = ""
        if (currAttack == 1) {
            animation.runImageAnimation(
            playerRobot,
            customUtils.readDataImageArray(playerRobot, "playerAttackLeft1"),
            100,
            false
            )
            currAttack = 2
        } else {
            animation.runImageAnimation(
            playerRobot,
            customUtils.readDataImageArray(playerRobot, "playerAttackLeft2"),
            100,
            false
            )
            currAttack = 1
        }
        animWait = 400
    } else {
    	
    }
    timer.after(animWait, function () {
        attacking = false
        if (!(inAir)) {
            characterAnimations.setCharacterAnimationsEnabled(playerRobot, true)
        }
        if (nextAttack != "") {
            handleAttack()
        }
    })
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (characterAnimations.matchesRule(playerRobot, characterAnimations.rule(Predicate.FacingRight))) {
        nextAttack = "right"
    } else {
        nextAttack = "left"
    }
    if (!(attacking)) {
        handleAttack()
    }
})
function assignPlayerAnimsGround (mySprite: Sprite) {
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
    characterAnimations.loopFrames(
    mySprite,
    customUtils.readDataImageArray(mySprite, "playerRunRight"),
    100,
    characterAnimations.rule(Predicate.MovingRight)
    )
    characterAnimations.loopFrames(
    mySprite,
    customUtils.readDataImageArray(mySprite, "playerRunLeft"),
    100,
    characterAnimations.rule(Predicate.MovingLeft)
    )
    characterAnimations.runFrames(
    mySprite,
    customUtils.readDataImageArray(mySprite, "playerJumpRight"),
    100,
    characterAnimations.rule(Predicate.MovingUp)
    )
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
    if (playerRobot.isHittingTile(CollisionDirection.Bottom)) {
        inAir = false
        if (!(animStateGround)) {
            if (characterAnimations.matchesRule(playerRobot, characterAnimations.rule(Predicate.FacingRight))) {
                animation.runImageAnimation(
                playerRobot,
                customUtils.readDataImageArray(playerRobot, "playerLandRight"),
                100,
                false
                )
            } else {
                animation.runImageAnimation(
                playerRobot,
                customUtils.readDataImageArray(playerRobot, "playerLandLeft"),
                100,
                false
                )
            }
            if (!(attacking)) {
                characterAnimations.setCharacterAnimationsEnabled(playerRobot, true)
            }
        }
        animStateGround = true
    } else {
        inAir = true
        if (animStateGround) {
            characterAnimations.setCharacterAnimationsEnabled(playerRobot, false)
            if (characterAnimations.matchesRule(playerRobot, characterAnimations.rule(Predicate.FacingRight))) {
                animation.runImageAnimation(
                playerRobot,
                customUtils.readDataImageArray(playerRobot, "playerJumpRight"),
                100,
                false
                )
            } else {
                animation.runImageAnimation(
                playerRobot,
                customUtils.readDataImageArray(playerRobot, "playerJumpLeft"),
                100,
                false
                )
            }
        }
        animStateGround = false
    }
}
sprites.onOverlap(SpriteKind.Player, SpriteKind.EndGoal, function (sprite, otherSprite) {
    if (attacking) {
        levelEnd.scale = 3
        levelEnd.z = 10
        animation.runImageAnimation(
        otherSprite,
        [img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . 4 4 . . . . . . . 
            . . . . . . 4 5 5 4 . . . . . . 
            . . . . . . 2 5 5 2 . . . . . . 
            . . . . . . . 2 2 . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `,img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . 4 . . . . . 
            . . . . 2 . . . . 4 4 . . . . . 
            . . . . 2 4 . . 4 5 4 . . . . . 
            . . . . . 2 4 d 5 5 4 . . . . . 
            . . . . . 2 5 5 5 5 4 . . . . . 
            . . . . . . 2 5 5 5 5 4 . . . . 
            . . . . . . 2 5 4 2 4 4 . . . . 
            . . . . . . 4 4 . . 2 4 4 . . . 
            . . . . . 4 4 . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `,img`
            . 3 . . . . . . . . . . . 4 . . 
            . 3 3 . . . . . . . . . 4 4 . . 
            . 3 d 3 . . 4 4 . . 4 4 d 4 . . 
            . . 3 5 3 4 5 5 4 4 d d 4 4 . . 
            . . 3 d 5 d 1 1 d 5 5 d 4 4 . . 
            . . 4 5 5 1 1 1 1 5 1 1 5 4 . . 
            . 4 5 5 5 5 1 1 5 1 1 1 d 4 4 . 
            . 4 d 5 1 1 5 5 5 1 1 1 5 5 4 . 
            . 4 4 5 1 1 5 5 5 5 5 d 5 5 4 . 
            . . 4 3 d 5 5 5 d 5 5 d d d 4 . 
            . 4 5 5 d 5 5 5 d d d 5 5 4 . . 
            . 4 5 5 d 3 5 d d 3 d 5 5 4 . . 
            . 4 4 d d 4 d d d 4 3 d d 4 . . 
            . . 4 5 4 4 4 4 4 4 4 4 4 . . . 
            . 4 5 4 . . 4 4 4 . . . 4 4 . . 
            . 4 4 . . . . . . . . . . 4 4 . 
            `,img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . b b . b b b . . . . . 
            . . . . b 1 1 b 1 1 1 b . . . . 
            . . b b 3 1 1 d d 1 d d b b . . 
            . b 1 1 d d b b b b b 1 1 b . . 
            . b 1 1 1 b . . . . . b d d b . 
            . . 3 d d b . . . . . b d 1 1 b 
            . b 1 d 3 . . . . . . . b 1 1 b 
            . b 1 1 b . . . . . . b b 1 d b 
            . b 1 d b . . . . . . b d 3 d b 
            . b b d d b . . . . b d d d b . 
            . b d d d d b . b b 3 d d 3 b . 
            . . b d d 3 3 b d 3 3 b b b . . 
            . . . b b b d d d d d b . . . . 
            . . . . . . b b b b b . . . . . 
            `,img`
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            . . . . . . . . . . . . . . . . 
            `],
        200,
        false
        )
        pause(800)
        sprites.destroy(levelEnd, effects.warmRadial, 500)
        game.gameOver(true)
    } else {
    	
    }
})
function spawnGoal (xLoc: number, yLoc: number) {
    levelEnd = sprites.create(img`
        ................
        .......111......
        ......1333......
        ......1311......
        ......3111......
        ......3b131.....
        ......b3b311....
        ......313131....
        .....b3131b1....
        .....b333113....
        .....bc31311....
        ....3bc31131....
        ....3bc1111.....
        ....3c31111.....
        ...33c111113....
        ...1b3111111....
        .....3111111....
        .....3113111....
        .....31131113...
        .bbbb31131111bb.
        b11133133111131b
        3113131331131313
        3113111331133313
        3111311331133113
        3111133333333113
        3111113333311113
        b11111111111111b
        3bb1111111111bb3
        1333333333333331
        13333bbbbbb33331
        b33333333333333b
        cbbbbbbbbbbbbbbc
        `, SpriteKind.EndGoal)
    levelEnd.setPosition(xLoc * 16 + 8, yLoc * 16 + 16)
    levelEnd.z = -10
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
let levelEnd: Sprite = null
let animStateGround = false
let inAir = false
let animWait = 0
let nextAttack = ""
let attacking = false
let playerRobot: Sprite = null
let currAttack = 0
let jumpPower = 0
let gravity = 0
let maxSpeed = 0
let speedScalar = 0
let linearDamping = 0
linearDamping = 12
speedScalar = 2
maxSpeed = 100
gravity = 400
jumpPower = -200
currAttack = 1
tiles.setCurrentTilemap(tilemap`Level1`)
scene.setBackgroundColor(9)
scroller.setLayerImage(scroller.BackgroundLayer.Layer0, assets.image`scaledIndustBkgd_1`)
scroller.setCameraScrollingMultipliers(0.2, 0, scroller.BackgroundLayer.Layer0)
scroller.setLayerImage(scroller.BackgroundLayer.Layer1, assets.image`scaledIndustBkgd_2`)
scroller.setCameraScrollingMultipliers(0.4, 0, scroller.BackgroundLayer.Layer1)
scroller.setLayerImage(scroller.BackgroundLayer.Layer2, assets.image`scaledIndustBkgd_3`)
scroller.setCameraScrollingMultipliers(0.8, 1, scroller.BackgroundLayer.Layer2)
playerRobot = sprites.create(assets.image`orange_robot_idle_1`, SpriteKind.Player)
playerRobot.setPosition(25, 150)
scene.cameraFollowSprite(playerRobot)
assemblePlayerAnims(playerRobot)
assignPlayerAnimsGround(playerRobot)
spawnGoal(30, 7)
game.onUpdate(function () {
    handlePlayerMovement()
})
