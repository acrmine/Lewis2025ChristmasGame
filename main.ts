enum ActionKind {
    Walking,
    Idle,
    Jumping
}
namespace SpriteKind {
    export const EndGoal = SpriteKind.create()
    export const Building = SpriteKind.create()
    export const Door = SpriteKind.create()
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
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (characterAnimations.matchesRule(playerRobot, characterAnimations.rule(Predicate.FacingRight))) {
        nextAttack = "right"
    } else {
        nextAttack = "left"
    }
    if (!(attacking)) {
        handleAttack()
    }
})
sprites.onOverlap(SpriteKind.Player, SpriteKind.Door, function (sprite, otherSprite) {
    tiles.loadConnectedMap(sprites.readDataNumber(otherSprite, "doorKind"))
    playerRobot.setPosition(sprites.readDataNumber(otherSprite, "nextX"), sprites.readDataNumber(otherSprite, "nextY"))
    backDoorExists = sprites.readDataBoolean(otherSprite, "bDoorExists")
    if (backDoorExists) {
        console.log("spawning door back")
        nDoorSprite = sprites.create(otherSprite.data[0], SpriteKind.Door)
        nDoorSprite.setPosition(sprites.readDataNumber(otherSprite, "bXLoc"), sprites.readDataNumber(otherSprite, "bYLoc"))
        sprites.setDataBoolean(nDoorSprite, "bDoorExists", backDoorExists)
        sprites.setDataNumber(nDoorSprite, "nextX", sprites.readDataNumber(otherSprite, "bNextX"))
        sprites.setDataNumber(nDoorSprite, "nextY", sprites.readDataNumber(otherSprite, "bNextY"))
        sprites.setDataNumber(nDoorSprite, "doorKind", sprites.readDataNumber(otherSprite, "nDoorKind"))
        nDoorSprite.data[0] = otherSprite.image
        sprites.setDataNumber(nDoorSprite, "bXLoc", otherSprite.x)
        sprites.setDataNumber(nDoorSprite, "bYLoc", otherSprite.y)
        sprites.setDataNumber(nDoorSprite, "bNextX", sprites.readDataNumber(otherSprite, "nextX"))
        sprites.setDataNumber(nDoorSprite, "bNextY", sprites.readDataNumber(otherSprite, "nextY"))
        sprites.setDataNumber(nDoorSprite, "nDoorKind", sprites.readDataNumber(otherSprite, "doorKind"))
    }
    sprites.destroy(otherSprite)
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
    if (controller.A.isPressed() && playerRobot.isHittingTile(CollisionDirection.Bottom)) {
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
let backDoorExists = false
let house: Sprite = null
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
let inHouse1: tiles.WorldMap = null
let mainLevel: tiles.WorldMap = null
let exitDoor = null
let nDoorSprite: Sprite = null
function spawnDoor (doorImage: Image, xLoc: number, yLoc: number, nSpawnX: number, nSpawnY: number, currentLocation: tiles.WorldMap, newLocation: tiles.WorldMap, door: number, 
                    bDoorExists: boolean, bDoorImage: Image = null, bXLoc: number = null, bYLoc: number = null, bnSpawnX: number = null, bnSpawnY: number = null, nDoor: number = null) {
    let doorSprite = sprites.create(doorImage, SpriteKind.Door)
    doorSprite.setPosition((xLoc * 16) + (doorImage.width / 2), (yLoc * 16) + (doorImage.height / 2))
    tiles.connectMapById(currentLocation, newLocation, door)
    sprites.setDataBoolean(doorSprite, "bDoorExists", bDoorExists)
    sprites.setDataNumber(doorSprite, "nextX", (nSpawnX * 16) + 16)
    sprites.setDataNumber(doorSprite, "nextY", (nSpawnY * 16) + 16)
    sprites.setDataNumber(doorSprite, "doorKind", door)
    if (bDoorExists) {
        console.log("got into connecting both locations")
        tiles.connectMapById(newLocation, currentLocation, nDoor)
        doorSprite.data[0] = bDoorImage
        sprites.setDataNumber(doorSprite, "bXLoc", (bXLoc * 16) + (bDoorImage.width / 2))
        sprites.setDataNumber(doorSprite, "bYLoc", (bYLoc * 16) + (bDoorImage.height / 2))
        sprites.setDataNumber(doorSprite, "bNextX", (bnSpawnX * 16) + 16)
        sprites.setDataNumber(doorSprite, "bNextY", (bnSpawnY * 16) + 16)
        sprites.setDataNumber(doorSprite, "nDoorKind", nDoor)
    }
}
linearDamping = 12
speedScalar = 2
maxSpeed = 100
gravity = 400
jumpPower = -200
currAttack = 1
mainLevel = tiles.createMap(tilemap`Level1`)
inHouse1 = tiles.createMap(tilemap`insideHouse1`)
tiles.loadMap(mainLevel)
scroller.setLayerImage(scroller.BackgroundLayer.Layer0, img`
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffcffffffffffcffffffffffffffffffffffffffffcffffffffffcffffffffffffffffffffffffffffcffffffffffcffffffffffffffffffffffffffffcffffffffffcffffffffffffffffffffff
    ffffffffffffffffcbcffffffffffffffffffffcffffffffffffffffcbcffffffffffffffffffffcffffffffffffffffcbcffffffffffffffffffffcffffffffffffffffcbcffffffffffffffffffffc
    fffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffff
    fffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcffffffffffff
    fff3fffffffffffffffffffffbbbfffffffffffffff3fffffffffffffffffffffbbbfffffffffffffff3fffffffffffffffffffffbbbfffffffffffffff3fffffffffffffffffffffbbbffffffffffff
    ffb3bffffffffffffffffffffcbcffffffffffffffb3bffffffffffffffffffffcbcffffffffffffffb3bffffffffffffffffffffcbcffffffffffffffb3bffffffffffffffffffffcbcffffffffffff
    f33333ffffffffffffccfffffffffffffffffffff33333ffffffffffffccfffffffffffffffffffff33333ffffffffffffccfffffffffffffffffffff33333ffffffffffffccffffffffffffffffffff
    ff3b3fffffffffffffccffffffffffffffffffffff3b3fffffffffffffccffffffffffffffffffffff3b3fffffffffffffccffffffffffffffffffffff3b3fffffffffffffccffffffffffffffffffff
    ffbfbfffffffffffffffffffffffffffffcfffffffbfbfffffffffffffffffffffffffffffcfffffffbfbfffffffffffffffffffffffffffffcfffffffbfbfffffffffffffffffffffffffffffcfffff
    fffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcffff
    fffffffffffcffffffffffffffffffffffcffffffffffffffffcffffffffffffffffffffffcffffffffffffffffcffffffffffffffffffffffcffffffffffffffffcffffffffffffffffffffffcfffff
    ffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffffffffffffffcbcfffffffffffffffffffffffffff
    fffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    fcfffffffffffffffffffffffffcfffffffffffffcfffffffffffffffffffffffffcfffffffffffffcfffffffffffffffffffffffffcfffffffffffffcfffffffffffffffffffffffffcffffffffffff
    fffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffffffffffffffffffffffffffffffffffffffcfffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff
    ffffffccfffffcffffffffffffffffffffffffffffffffccfffffcffffffffffffffffffffffffffffffffccfffffcffffffffffffffffffffffffffffffffccfffffcffffffffffffffffffffffffff
    ffffffccfffffffffffffcccccccccccffffffffffffffccfffffffffffffcccccccccccffffffffffffffccfffffffffffffcccccccccccffffffffffffffccfffffffffffffcccccccccccffffffff
    ffffffffffffffffccccccccccccccccccccffffffffffffffffffffccccccccccccccccccccffffffffffffffffffffccccccccccccccccccccffffffffffffffffffffccccccccccccccccccccffff
    fffffffffffffccccccccccccccccccccccccccffffffffffffffccccccccccccccccccccccccccffffffffffffffccccccccccccccccccccccccccffffffffffffffccccccccccccccccccccccccccf
    ccfffffffffcccccccccccccccccccccccccccccccfffffffffcccccccccccccccccccccccccccccccfffffffffcccccccccccccccccccccccccccccccfffffffffccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc
    bbbbbbbbbbbbccccccccccccccccccccbbbbbbbbbbbbbbbbbbbbccccccccccccccccccccbbbbbbbbbbbbbbbbbbbbccccccccccccccccccccbbbbbbbbbbbbbbbbbbbbccccccccccccccccccccbbbbbbbb
    bbbbbbbbbbbbbbbbbccccccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbccccccccccbbbbbbbbbbbbb
    bbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbb
    bbbbbbbbb3333333bbbbbbbbb33cbbbbbbbbbbbbbbbbbbbbb3333333bbbbbbbbb33cbbbbbbbbbbbbbbbbbbbbb3333333bbbbbbbbb33cbbbbbbbbbbbbbbbbbbbbb3333333bbbbbbbbb33cbbbbbbbbbbbb
    bbbbbbb33cccccbb33bbbbbbbccbbccbbbbbbbbbbbbbbbb33cccccbb33bbbbbbbccbbccbbbbbbbbbbbbbbbb33cccccbb33bbbbbbbccbbccbbbbbbbbbbbbbbbb33cccccbb33bbbbbbbccbbccbbbbbbbbb
    bbbbbbbcccbbbbbcccbbbbbbbbccccbbbbbbbbbbbbbbbbbcccbbbbbcccbbbbbbbbccccbbbbbbbbbbbbbbbbbcccbbbbbcccbbbbbbbbccccbbbbbbbbbbbbbbbbbcccbbbbbcccbbbbbbbbccccbbbbbbbbbb
    3bbbbbbbcccccccccbbbbbbbbbbbbbbb333333333bbbbbbbcccccccccbbbbbbbbbbbbbbb333333333bbbbbbbcccccccccbbbbbbbbbbbbbbb333333333bbbbbbbcccccccccbbbbbbbbbbbbbbb33333333
    333bbbbbbbcccccbbbbbbbbbbbbbbb333ccbbbbb333bbbbbbbcccccbbbbbbbbbbbbbbb333ccbbbbb333bbbbbbbcccccbbbbbbbbbbbbbbb333ccbbbbb333bbbbbbbcccccbbbbbbbbbbbbbbb333ccbbbbb
    cc3bbbbbbbbbbbbbbbbbbbbbbbbbbb3cccbbbccccc3bbbbbbbbbbbbbbbbbbbbbbbbbbb3cccbbbccccc3bbbbbbbbbbbbbbbbbbbbbbbbbbb3cccbbbccccc3bbbbbbbbbbbbbbbbbbbbbbbbbbb3cccbbbccc
    cccbbbbbbbbbbbb333bbbbbb3bbbbbcccbbbbbcccccbbbbbbbbbbbb333bbbbbb3bbbbbcccbbbbbcccccbbbbbbbbbbbb333bbbbbb3bbbbbcccbbbbbcccccbbbbbbbbbbbb333bbbbbb3bbbbbcccbbbbbcc
    cccbbbbbbbbbbbb333bbbbbbbbbbbbcccccccccccccbbbbbbbbbbbb333bbbbbbbbbbbbcccccccccccccbbbbbbbbbbbb333bbbbbbbbbbbbcccccccccccccbbbbbbbbbbbb333bbbbbbbbbbbbcccccccccc
    cbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccccccbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbcccccccc
    bbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb3333bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb
    bbb333333bbb33ddddddddddddddddd33bbbbbbbbbb333333bbb33ddddddddddddddddd33bbbbbbbbbb333333bbb33ddddddddddddddddd33bbbbbbbbbb333333bbb33ddddddddddddddddd33bbbbbbb
    bbb33333ddddddddddddddddddddddddddddd3bbbbb33333ddddddddddddddddddddddddddddd3bbbbb33333ddddddddddddddddddddddddddddd3bbbbb33333ddddddddddddddddddddddddddddd3bb
    dddddddddddddddddddddddddddddddd33333ddddddddddddddddddddddddddddddddddd33333ddddddddddddddddddddddddddddddddddd33333ddddddddddddddddddddddddddddddddddd33333ddd
    dddddddddddddd3333333333ddddddd33dddd33ddddddddddddddd3333333333ddddddd33dddd33ddddddddddddddd3333333333ddddddd33dddd33ddddddddddddddd3333333333ddddddd33dddd33d
    dddddddddddd333ddddddddd33dddddbbbbbbbbddddddddddddd333ddddddddd33dddddbbbbbbbbddddddddddddd333ddddddddd33dddddbbbbbbbbddddddddddddd333ddddddddd33dddddbbbbbbbbd
    ddddddddddd333d3bbbbbbbbd33dddddbbbbbbddddddddddddd333d3bbbbbbbbd33dddddbbbbbbddddddddddddd333d3bbbbbbbbd33dddddbbbbbbddddddddddddd333d3bbbbbbbbd33dddddbbbbbbdd
    ddddddddddd33bbbbbbbbbbbb33dddddddddddddddddddddddd33bbbbbbbbbbbb33dddddddddddddddddddddddd33bbbbbbbbbbbb33dddddddddddddddddddddddd33bbbbbbbbbbbb33ddddddddddddd
    ddddddddddddbbbbbbbbbbbbbbddddddddddddddddddddddddddbbbbbbbbbbbbbbddddddddddddddddddddddddddbbbbbbbbbbbbbbddddddddddddddddddddddddddbbbbbbbbbbbbbbdddddddddddddd
    ddddddddddddd3bbbbbbbbbb3dddddddddddddddddddddddddddd3bbbbbbbbbb3dddddddddddddddddddddddddddd3bbbbbbbbbb3dddddddddddddddddddddddddddd3bbbbbbbbbb3ddddddddddddddd
    d333333ddddddddd333333ddddddddddddddddddd333333ddddddddd333333ddddddddddddddddddd333333ddddddddd333333ddddddddddddddddddd333333ddddddddd333333dddddddddddddddddd
    333333333dddddddddddddddddddddddddddddd3333333333dddddddddddddddddddddddddddddd3333333333dddddddddddddddddddddddddddddd3333333333dddddddddddddddddddddddddddddd3
    33333333dddddddddddddddddddddddddddddddd33333333dddddddddddddddddddddddddddddddd33333333dddddddddddddddddddddddddddddddd33333333dddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddd3333333333333ddddddddddddddddddddddddddd3333333333333ddddddddddddddddddddddddddd3333333333333ddddddddddddddddddddddddddd3333333333333d
    33ddddddddddddddddddddd333dddddddddddd3333ddddddddddddddddddddd333dddddddddddd3333ddddddddddddddddddddd333dddddddddddd3333ddddddddddddddddddddd333dddddddddddd33
    d333ddddddddddddddddd333ddddddddddddddddd333ddddddddddddddddd333ddddddddddddddddd333ddddddddddddddddd333ddddddddddddddddd333ddddddddddddddddd333dddddddddddddddd
    ddd33ddddddddddddddd33dddd3bbbbbbbbbbb3dddd33ddddddddddddddd33dddd3bbbbbbbbbbb3dddd33ddddddddddddddd33dddd3bbbbbbbbbbb3dddd33ddddddddddddddd33dddd3bbbbbbbbbbb3d
    b3dd3ddddddddddddddd3dd3bbbbbbbbbbbbbbbbb3dd3ddddddddddddddd3dd3bbbbbbbbbbbbbbbbb3dd3ddddddddddddddd3dd3bbbbbbbbbbbbbbbbb3dd3ddddddddddddddd3dd3bbbbbbbbbbbbbbbb
    bb333ddddddddddddddd33bbbbbbbbbbbbbbbbbbbb333ddddddddddddddd33bbbbbbbbbbbbbbbbbbbb333ddddddddddddddd33bbbbbbbbbbbbbbbbbbbb333ddddddddddddddd33bbbbbbbbbbbbbbbbbb
    bbb3dddddddddddddddd3bbbbbbbbbbbbbbbbbbbbbb3dddddddddddddddd3bbbbbbbbbbbbbbbbbbbbbb3dddddddddddddddd3bbbbbbbbbbbbbbbbbbbbbb3dddddddddddddddd3bbbbbbbbbbbbbbbbbbb
    b3ddddddddddddddddddd3bbbbbbbbbbbbbbbbbbb3ddddddddddddddddddd3bbbbbbbbbbbbbbbbbbb3ddddddddddddddddddd3bbbbbbbbbbbbbbbbbbb3ddddddddddddddddddd3bbbbbbbbbbbbbbbbbb
    dddddddddddddddddddddddd3bbbbbbbbbbbbb33dddddddddddddddddddddddd3bbbbbbbbbbbbb33dddddddddddddddddddddddd3bbbbbbbbbbbbb33dddddddddddddddddddddddd3bbbbbbbbbbbbb33
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd
    dddddddddd3333333333333ddddddddddddddddddddddddddd3333333333333ddddddddddddddddddddddddddd3333333333333ddddddddddddddddddddddddddd3333333333333ddddddddddddddddd
    dddddd333333333333333333333ddddddddddddddddddd333333333333333333333ddddddddddddddddddd333333333333333333333ddddddddddddddddddd333333333333333333333ddddddddddddd
    dddd3333333333333333ddd3333333dddddddddddddd3333333333333333ddd3333333dddddddddddddd3333333333333333ddd3333333dddddddddddddd3333333333333333ddd3333333dddddddddd
    dd3333333333333333333dddddd333333ddddddddd3333333333333333333dddddd333333ddddddddd3333333333333333333dddddd333333ddddddddd3333333333333333333dddddd333333ddddddd
    3333333333333333333333ddddddddddddddd3333333333333333333333333ddddddddddddddd3333333333333333333333333ddddddddddddddd3333333333333333333333333ddddddddddddddd333
    33333333333333333333333333dddddddd33333333333333333333333333333333dddddddd33333333333333333333333333333333dddddddd33333333333333333333333333333333dddddddd333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    3333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
    `)
scroller.setCameraScrollingMultipliers(1, 1)
playerRobot = sprites.create(assets.image`orange_robot_idle_1`, SpriteKind.Player)
playerRobot.setPosition(25, 150)
playerRobot.z = 6
scene.cameraFollowSprite(playerRobot)
assemblePlayerAnims(playerRobot)
assignPlayerAnimsGround(playerRobot)
spawnGoal(30, 7)
spawnDoor(img`
....................8a8aa8a8....................
.................aaa888aa8a8aaa.................
..............aaa8aa8a8aa888aa8aaa..............
...........8aa8aa8888a8aa8a8888aa8aa8...........
........8888aa8aa8aa8a8aa8a8aa8aa8aa8888........
.....aaa8aa8aa8888aa8a8aa8a8aa8888aa8aa8aaa.....
...aa8888aa8aa8aa8aa888aa888aa8aa8aa8aa8888aa...
dccaa8aa8aa8888aa8aa8a8aa8a8aa8aa8888aa8aa8aaccd
bcb888aa8aa8aa8aa8aa8a8aa8a8aa8aa8aa8aa8aa888bcb
dbbaa8aa8888aa8aa8888a8aa8a8888aa8aa8888aa8aabbd
dbbaa8aa8aa8aa8888aa8a8aa8a8aa8888aa8aa8aa8aabbd
dccaa8888aa8aa8aa8aa888aa888aa8aa8aa8aa8888aaccd
bcbaa8aa8aa8888aa8aa8a8aa8a8aa8aa8888aa8aa8aabcb
dbb888aa8aa8aa8aa8aa8a8aa8a8aa8aa8aa8aa8aa888bbd
dbbaa8aa8888aa8aa8aa8a8aa8a8aa8aa8aa8888aa8aabbd
dccaa8aa8aa8aa8aa8888a8aa8a8888aa8aa8aa8aa8aaccd
bcbaa8888aa8aa8888aa888aa888aa8888aa8aa8888aabcb
dbbaa8aa8aa8888aa8aa8a8aa8a8aa8aa8888aa8aa8aabbd
dbb888aa8aa8aa8aa8aa8a8aa8a8aa8aa8aa8aa8aa888bbd
dccaa8aa8888aa8aa8aa8a8aa8a8aa8aa8aa8888aa8aaccd
bcbaa8aa8aa8aa8aa8aa888aa888aa8aa8aa8aa8aa8aabcb
dbbaa8888aa8aa8aa888ccbbbbcc888aa8aa8aa8888aabbd
dbbaa8aa8aa8aa888ccbbbbbbbbbbcc888aa8aa8aa8aabbd
dcc888aa8aa888ccbbbbbccccccbbbbbcc888aa8aa888ccd
bcbaa8aa888ccbbbbbccbddddddbccbbbbbcc888aa8aabcb
dbbaa8aaccbbbbbccbddddddddddddbccbbbbbccaa8aabbd
dbbaaccbbbbcccbddddddddddddddddddbcccbbbbccaabbd
dcccbbbbcccbdddbccbbbbbbbbbbbbccbdddbcccbbbbcccd
ccccccccbbbbbbbcbddddddddddddddbcbbbbbbbcccccccc
bddddddddddddbcddddddddddddddddddcbddddddddddddb
bbcbdddddddddcbd1111111111111111dbcdddddddddbcbb
bbbcccccccccccd1bbbbbbbbbbbbbbbb1dcccccccccccbbb
bbbbdddddddddc11beeeeeeeeeeeeeeb11cdddddddddbbbb
bbb8aaaaaaa8dc1be3b33b33b33b33beb1cd8aaaaaaa8bbb
bbb888888888dc1be3b33b33b33b33beb1cd888888888bbb
bbb833333338dcbbf3b3effffffe33bebbcd833333338bbb
bbb83ff3ff38dcbbf3bffffffffff3bebbcd83ff3ff38bbb
bbb83cc3cc38dcbbf3effffffffffebebbcd83cc3cc38bbb
bbb833333338dcbbf3eeeeeeeeeeeebebbcd833333338bbb
cbb83ff3ff38dcbbe3b33b33b33b33bebbcd83ff3ff38bbc
cbb83cc3cc38dcbbe3b33b33b33b33bebbcd83cc3cc38bbc
ccbbbbbbbbbbdcbbe3b33b33b33feeeebbcdbbbbbbbbbbcc
.cbbdddddddddcbbe3b33b33b33ffffebbcdddddddddbbc.
..cbdbbbdbbbdcbbf3b33b33b33f33febbcdbbbdbbbdbc..
...cdbbbdbbbdcbbf3b33b33b33bffeebbcdbbbdbbbdc...
....bddddddddcbbf3b33b33b33b33bebbcddddddddb....
.....bdbbbdddcbbf3b33b33b33b33bebbcdddbbbdb.....
......bcccbbbcbbe3b33b33b33b33bebbcbbbcccb......
`, 0, 4.5, 8, 11, mainLevel, inHouse1, ConnectionKind.Door1, true, img`
c b b b b b b b b b b b b b b c 
c b b b b b b b b b b b b b b c 
c d d d d d d d d d d d d d d c 
c d d d d d d d d d d d d d d c 
c c c c c c c c c c c c c c c c 
c b b b f f f f f f f f b b b c 
c d d b f f f f f f f f b d d c 
c d d b f f f f f f f f b d d c 
c d d b f f f f f f f f b d d c 
c d d b f f f f f f f f b d d c 
c b b c f f f f f f f f c b b c 
c d d b f f f f f f f f b d d c 
c d d b f f f f f c c f b d d c 
c d d b f c c c f f f f b d d c 
c d d b c c c f f c c c b d d c 
a c c a c c c c c c c c a c c a 
`, 12, 12, 3.5, 5, ConnectionKind.Door1)
game.onUpdate(function () {
    handlePlayerMovement()
})
