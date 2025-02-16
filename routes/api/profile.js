const express=require('express');
const router=express.Router();
const auth=require('../../middleware/auth');
const Profile=require('../../models/Profile');
const User=require('../../models/User');
const {check,validationResult}=require('express-validator');

//@route GET api/profile
//@desp Test Route
//access Public

router.get('/me',auth,async (req,res)=>{
    try{
        const profile=await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile)
        return res.status(400).json({msg:'there is no profile for this user'});

        res.json(profile)
    }catch(err)
    {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


//@route POST api/profile
//@desp create or update userprofile
//access Public

router.post(
    '/',
    auth,
    check('status', 'Status is required').notEmpty(),
    check('skills', 'Skills is required').notEmpty(),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        company,
        website,
        location,
        bio,
        status,
        githubusername,
        skills,
        youtube,
        facebook,
        twitter,
        instagram,
        linkedin
      }= req.body;

      const profileFields={};
      profileFields.user=req.user.id;
      if(company) profileFields.company=company;
      if(website) profileFields.website=website;
      if(location) profileFields.location=location;
      if(bio) profileFields.bio=bio;
      if(status) profileFields.status=status;
      if(githubusername) profileFields.githubusername=githubusername;
      if(skills){
         profileFields.skills=skills.split(',').map(skill=>skill.trim());
      }  
     // build social object
     profileFields.social={};
     if(youtube) profileFields.social.youtube=youtube;
     if(twitter) profileFields.social.twitter=twitter;
     if(facebook) profileFields.social.facebook=facebook;
     if(linkedin) profileFields.social.linkedin=linkedin;
     if(instagram) profileFields.social.instagram=instagram;

      try{
        let profile= await Profile.findOne({user: req.user.id});

        if(profile){
          //update
          profile =await Profile.findOneAndUpdate(
            {user:req.user.id},
            {$set:profileFields},
            {new:true}
          );
          return res.json(profile);
        }

        //create

        profile=new Profile(profileFields);
        await profile.save();
        res.json(profile);
      }catch(err){
        console.error(err.message);
        res.status(500).send('server error');
      }
    
    });

    //@route GET api/profile
//@desp Get all profile
//access Public

router.get('/',async (req,res)=>{
  try{
    const profiles=await Profile.find().populate('user',['name','avatar']);
    res.json(profiles);
  }catch(err)
  {
    console.error(err.message);
    res.status(500).send('Server error');
  }
})


 //@route GET api/profile using user id
//@desp Get user id profile
//access Public

router.get(
  '/user/:user_id',
  async ({ params: { user_id } }, res) => {
    try {
      const profile = await Profile.findOne({
        user: user_id
      }).populate('user', ['name', 'avatar']);

      if (!profile) return res.status(400).json({ msg: 'Profile not found' });

      return res.json(profile);
    } catch (err) {
      console.error(err.message);
      if(err.kind=="ObjectId"){
        return res.status(400).json({msg:'Profile not found'});
      }
      return res.status(500).json({ msg: 'Server error' });
    }
  }
);

//DELETE Profile using user  id
//access private

router.delete('/',auth,async (req,res)=>{
  try{
    await Profile.findOneAndDelete({user:req.user.id});
    await User.findOneAndDelete({_id:req.user.id});
    res.json({msg:'User Deleted'});
  }catch(err)
  {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
})

//@route PUT apo/profile/experience
//@desc Add profile experience
//@access Private

router.put('/experience',[auth,[
  check('title','Title is required').not().isEmpty(),
  check('company','Company is required').not().isEmpty(),
  check('from','From Date is required').not().isEmpty()
] ], async (req,res)=>{
   const errors=validationResult(req);
   if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
   }
   const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
   }= req.body;

   const newExp={
    title,
    company,
    location,
    from,
    to,
    current,
    description
   }

   try{
    const profile= await Profile.findOne({user:req.user.id});
    profile.experience.unshift(newExp);
    await profile.save();

    res.json(profile);

   }catch(err)
   {
    console.error(err.message);
    res.status(500).send('Server Error');
   }
})
// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
try {
  const profile = await Profile.findOne({ user: req.user.id });

  //get remove index
  const removeIndex=profile.experience
  .map(item=>item.id)
  .indexOf(req.params.exp_id);
  profile.experience.splice(removeIndex,1);
  await profile.save();
  res.json(profile);
} catch (error) {
  console.error(error);
  return res.status(500).json({ msg: 'Server error' });
}
});

//@route PUT api/profile/education
//@desc Add profile education
//@access Private

router.put('/education',[auth,[
  check('school','School is required').not().isEmpty(),
  check('degree','Degree is required').not().isEmpty(),
  check('fieldofstudy','Field of study is required').not().isEmpty(),
  check('from','From Date is required').not().isEmpty(),
] ], async (req,res)=>{
   const errors=validationResult(req);
   if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
   }
   const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
   }= req.body;

   const newEdu={
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
   }

   try{
    const profile= await Profile.findOne({user:req.user.id});
    profile.education.unshift(newEdu);
    await profile.save();

    res.json(profile);

   }catch(err)
   {
    console.error(err.message);
    res.status(500).send('Server Error');
   }
})
// @route    DELETE api/profile/education/:edu_id
// @desc     Delete experience from profile
// @access   Private
router.delete('/education/:edu_id', auth, async (req, res) => {
try {
  const profile = await Profile.findOne({ user: req.user.id });

  //get remove index
  const removeIndex=profile.education
  .map(item=>item.id)
  .indexOf(req.params.edu_id);
  profile.education.splice(removeIndex,1);
  await profile.save();
  res.json(profile);
} catch (error) {
  console.error(error);
  return res.status(500).json({ msg: 'Server error' });
}
});
module.exports=router;