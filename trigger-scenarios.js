// 1. 点击"立即开通会员"按钮
const handleUpgradeClick = () => {
  showMembershipDialog.value = true
}

// 2. 访问受限功能时
const handleRestrictedFeature = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) {
    showMembershipDialog.value = true
    return
  }
  // 执行功能逻辑
}

// 3. 权限检查失败时
const checkPermissionAndShowDialog = (requiredLevel) => {
  const userLevel = authStore.userInfo?.isPaid || 0
  if (userLevel < requiredLevel) {
    showMembershipDialog.value = true
    return false
  }
  return true
}