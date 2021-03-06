> [查看IThink小程序代码 https://git.weixin.qq.com/PorYoung/IThink.git](https://git.weixin.qq.com/PorYoung/IThink)

# 2018年大学生微信小程序应用开发大赛参赛作品IThink介绍文档
> 参赛团队：文字数字字母
> IThink small program NodeJs back end

## 1 IThink小程序说明

IThink小程序致力于使有视觉障碍的人群能和普通人一样平等、便利地获得和分享智慧。IThink在传统社区模式的基础上增加了视觉障碍人群的辅助模块，包括通过使用加速度计判断手机运动状态来辅助操作，通过AI语音合成来反馈信息，通过上传语音和AI语音识别来实现文字输入，进行信息分享。IThink在参考《基于重力感应器的盲人手机的设计与实现》等相关论文的基础上，设计了比较完整的操作反馈模式。

## 2 IThink小程序应用场景

在这个繁杂的信息时代，人们迷失在庞大的社交网络和海量的新闻资讯中，多数时候，我们疲于应付，我们更多的时候在看，在听，在跟风，似乎只有这样，我们才能不在这个时代落伍。正因如此，我们很少有时间静下来思考，也越来越难静下来，我们看着手机，在各种自媒体间跳转，看着他们诉诸喜恶。

小程序的出现，让我们无需下载app，即能方便地使用各种应用，这位IThink的出现提供了条件。在百忙之中，人们也可以抽出时间，打开小程序，获取经过精心编辑而非算法筛选的大众内容没有人情味的推荐，包括音乐，美文以及书籍等，在这几分钟的时间，可以尝试静下来，慢下来，尝试多一些思考，如果有好的灵感，也能分享给其他用户。用户也可以查看其他用户的想法，了解大家不同的思维和看法，在交流中进步。

此外，传统的应用或者网站在设计开发过程中，很难兼顾普通用户和部分有视觉障碍的用户，造成他们即使使用读屏软件，也不能方便地使用。IThink在参考相关论文后，尝试将重力感应和AI自然语言处理运用到小程序中，提供一种适应视觉障碍用户的解决思路。

## 3 IThink解决的实际问题

造成视觉障碍用户使用不便的最大障碍是视觉，因此，小程序的界面设计无法产生效果，点击状态最多使用3种，包括单击、双击和长按，再增加点击状态一个是实现困难，而且也会造成用户使用的不便。其次，视觉障碍用户无法通过视觉获取文字信息，传统读屏软件，存在兼容性问题，而且在界面设计复杂或者没有适配的情况下也不会很好地处理 。此外，视觉障碍用户的文字输入也很不方便。

针对以上问题，我们考虑建立不同操作状态，来区分用户的操作。

目前设计的操作状态有：左翻手机，右翻手机，手机面朝自己翻动，单击屏幕，双击屏幕，长按屏幕，左划屏幕，右划屏幕，上划屏幕，下划屏幕。

不同的操作状态所实现的功能会在相应界面以语音的方式提示用户，操作成功或失败也会获得语音反馈。

文字信息的问题可以使用各开放平台的自然语言处理API来解决。

## 4 IThink技术开发方案

### 4.1 建立和识别操作状态

在小程序的API中，有加速度计相关的API，我们可以通过调用该API来获取手机的三轴值，并通过进行相关计算，区分手机的状态。

首先根据三个轴的值计算出手机绕Y轴旋转的角度Roll和绕X轴旋转的角度Pitch，通过判断短时间内手机的翻动角度来确定运动状态，翻动并复原位置视为一次完整的操作。例如，手机左翻的判断：当Roll的值大于45度，并且手机复原位置时，触发左翻动作。

除了判断手机运动的状态外，还要考虑不同状态间的相互影响，以及连续两次或多次操作时的处理。由于API在小程序全局有效，还需要根据不同页面进行判断并调用相遇的处理函数。此外，还需要考虑用户误操作的情况，我们使用锁定和解锁的方式来避免用户误操作，用户只需要长按屏幕即可锁定或解锁。

由于微信小程序的点击事件只有单击tap和长按longpress，为了实现三个点击状态，我们在tap和doubletap间作300ms延迟的区别，如果300ms内连续两次触发tap，则为双击事件。

该部分具体的实现在源代码lib/ accelerometerControl.js和lib/ blindTapHandle.js中。

### 4.2 自然语言处理

为了方便视觉障碍用户和普通用户间的交流，我们使用科大讯飞和腾讯的自然语言处理API来处理文字信息。

由于各大平台相关要求不同，我们对不同内容使用不同平台的API。

对于短文本，我们使用腾讯语音合成API合成语音，包括用户信息，系统提示，操作反馈等等。

对于长文本，我们进行分割处理后使用讯飞语音合成API合成语音，包括每日推荐的内容，用户发布的想法等。

对于视觉障碍用户上传的语音信息，我们使用讯飞语音听写API生成文字信息，而用户也可以选择是否使用原声，如果使用原声，则视觉障碍用户将听到原声而非合成音。

### 4.3 小程序主要功能

小程序主要功能包括：

- 主页：获取今日推荐
- 编辑页面：发布想法
- 社区页面：查看其他用户的想法，点赞加入收藏
- 历史想法页面：查看自己发布的历史想法
- 收藏页面：查看自己收藏的想法
- 建议反馈

功能结构如图:
![image.png](https://i.loli.net/2021/01/13/HaMwcztIoF5QYWn.png)

## 5 附加说明
由于时间有限，加上首次尝试开发小程序，IThink从设计到实现都缺乏系统的构思和开发、测试流程，因此IThink的立足点并非一款吸纳用户流量然后创造商业价值的小程序，我们旨在为今后有为视觉障碍用户开发服务类的小程序的需要的开发者提供一种设计思路，并做了一定尝试，同时也在实践中不断完善设计思路。

就在小程序提交时，微信小程序发布了微信同声传译插件，提供了语音识别，文本翻译，语音合成等功能，流式语音识别的方式将更加友好，提高了用户体验，并且调用次数比较于我们现在使用的API更多。后续我们将考虑使用微信同声传译插件替换我们的语音识别板块以增加稳定性和用户体验。

目前小程序的推荐内容正在召集成员专门进行编辑和管理，相比由开发人员管理，效率和质量会得到显著提升。后续也可能开发用户编辑推荐并上传的功能，后台审核并发布，以增加内容的丰富性。

> JAVA后端实现
![JAVA后端实现](https://i.loli.net/2021/01/14/mRY6CekiS7tNBbL.png)
