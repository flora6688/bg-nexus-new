/* Interactive form preview only. No credentials are stored or sent without an auth service. */
(() => {
  const isRegister = document.body.dataset.authPage === 'register';
  document.title = `${isRegister ? '注册' : '登录'} · BG Nexus`;
  document.querySelectorAll('.auth-reveal').forEach(button => {
    const input = document.getElementById(button.getAttribute('aria-controls'));
    const label = document.querySelector(`label[for="${input.id}"]`).textContent;
    button.addEventListener('click', () => {
      const reveal = input.type === 'password';
      input.type = reveal ? 'text' : 'password';
      button.setAttribute('aria-pressed', String(reveal));
      button.setAttribute('aria-label', `${reveal ? '隐藏' : '显示'}${label}`);
    });
  });
  const error = (input, message = '') => {
    input.setAttribute('aria-invalid', String(Boolean(message)));
    const hint = document.getElementById(`${input.id}-error`);
    hint.textContent = message;
    hint.hidden = !message;
    return !message;
  };
  document.querySelectorAll('.auth-form').forEach(form => {
    const register = form.id === 'register-form';
    const inputs = [...form.querySelectorAll('input')];
    const feedback = form.querySelector('.auth-feedback');
    const password = form.querySelector('input[autocomplete="new-password"]');
    const validate = input => {
      if (!input.value.trim()) return error(input, input.type === 'email' ? '请输入工作邮箱' : input.id.endsWith('-confirm') ? '请再次输入密码' : '请输入密码');
      if (input.type === 'email' && !input.validity.valid) return error(input, '请输入有效的邮箱地址');
      if (register && input === password && (input.value.length < 8 || !/[a-z]/i.test(input.value) || !/\d/.test(input.value))) return error(input, '请使用至少 8 位、包含字母和数字的密码');
      if (input.id.endsWith('-confirm') && input.value !== password.value) return error(input, '两次输入的密码不一致');
      return error(input);
    };
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        if (input.getAttribute('aria-invalid') === 'true') error(input);
        if (register && input === password) error(document.getElementById('register-confirm'));
        feedback.hidden = true;
      });
      input.addEventListener('blur', () => { if (input.value) validate(input); });
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      feedback.hidden = true;
      const valid = inputs.map(validate).every(Boolean);
      if (!valid) {
        form.querySelector('[aria-invalid="true"]').focus();
        return;
      }
      feedback.textContent = `当前预览尚未接入账号服务，暂时无法${register ? '创建账户' : '登录'}。填写的信息不会提交或保存。`;
      feedback.hidden = false;
      feedback.focus();
    });
    // Enable after installing the submit handler, preventing accidental native submission.
    form.querySelector('[type="submit"]').disabled = false;
  });
})();
