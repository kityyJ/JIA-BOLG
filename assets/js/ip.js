const fields = {
  current: {
    ip: document.querySelector('#current-ip'),
    location: document.querySelector('#current-location'),
    network: document.querySelector('#current-network')
  },
  result: {
    ip: document.querySelector('#result-ip'),
    location: document.querySelector('#result-location'),
    network: document.querySelector('#result-network')
  }
};

function formatLocation(data) {
  return [data.country_name, data.region, data.city].filter(Boolean).join(' · ') || '暂无信息';
}

function renderResult(target, data) {
  fields[target].ip.textContent = data.ip || '暂无信息';
  fields[target].location.textContent = formatLocation(data);
  fields[target].network.textContent = data.org || data.asn || '暂无信息';
}

async function fetchIp(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('服务暂时不可用');
  const data = await response.json();
  if (data.error) throw new Error(data.reason || '无法查询该 IP');
  return data;
}

async function loadCurrentIp() {
  const status = document.querySelector('#current-status');
  try {
    const data = await fetchIp('https://ipapi.co/json/');
    renderResult('current', data);
  } catch (error) {
    status.textContent = '暂时无法获取当前 IP，请稍后重试。';
    status.classList.add('is-error');
    Object.values(fields.current).forEach((field) => { field.textContent = '获取失败'; });
  }
}

document.querySelector('#query-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const input = document.querySelector('#ip-input');
  const button = document.querySelector('#query-button');
  const status = document.querySelector('#query-status');
  const ip = input.value.trim();

  status.classList.remove('is-error');
  if (!ip || !/^[0-9a-fA-F:.]+$/.test(ip)) {
    status.textContent = '请输入有效的 IPv4 或 IPv6 地址。';
    status.classList.add('is-error');
    input.focus();
    return;
  }

  button.disabled = true;
  button.textContent = '查询中…';
  status.textContent = '';
  Object.values(fields.result).forEach((field) => { field.textContent = '正在获取…'; });

  try {
    const data = await fetchIp(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
    renderResult('result', data);
    status.textContent = '查询完成。';
  } catch (error) {
    Object.values(fields.result).forEach((field) => { field.textContent = '查询失败'; });
    status.textContent = error.message || '无法查询该 IP，请稍后重试。';
    status.classList.add('is-error');
  } finally {
    button.disabled = false;
    button.textContent = '查询';
  }
});

loadCurrentIp();
