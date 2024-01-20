import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { findOne, create } from '../service/user.service.js';

export default (app) => {
    app.use(passport.initialize());

    passport.use(
        new KakaoStrategy(
            {
                clientID: process.env.KAKAO_ID,
                callbackURL: process.env.KAKAO_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const exUser = await findOne({
                        snsId: profile.id,
                    });

                    if (exUser) {
                        done(null, exUser);
                    } else {
                        const newUser = await create({
                            email: profile.account_email,
                            nickname: profile.profile_nickname,
                            snsId: profile.id,
                            image: profile.profile_image,
                            providerType: 'kakao',
                        });
                        done(null, newUser);
                    }
                } catch (error) {
                    console.error(error);
                    done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};