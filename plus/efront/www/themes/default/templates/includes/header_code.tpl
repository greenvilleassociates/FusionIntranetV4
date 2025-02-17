 <div id = "logo">
  <a href = "{if $smarty.session.s_login}{$smarty.server.PHP_SELF}{else}index.php{/if}">
   <img class = "handle" src = "{$T_LOGO}" title = "{$T_CONFIGURATION.site_name}" alt = "{$T_CONFIGURATION.site_name}" />
  </a>
 </div>
 {if $smarty.session.s_login}
 <script>
  var startUpdater = true;
  var updaterPeriod = '{$T_CONFIGURATION.updater_period}';
 </script>
 <div id = "logout_link" >
  {if $T_THEME_SETTINGS->options.sidebar_interface}
   {if $T_ONLINE_USERS_LIST && !$T_CONFIGURATION.disable_online_users}
    <span class = "headerText" >
    {strip}
     {$smarty.const._ONLINEUSERS}:&nbsp;
     (<a href = "javascript:void(0)" class = "info">
      <span id = "header_connected_users">{$T_ONLINE_USERS_LIST|@sizeof}</span>
      <span class = "tooltipSpan">
       {foreach name = 'online_users_list' item = "item" key = "key" from = $T_ONLINE_USERS_LIST }
        #filter:login-{$item.login}#{if !$smarty.foreach.online_users_list.last},&nbsp;{/if}
       {/foreach}
      </span>
     </a>)
    {/strip}
    </span>
      {/if}
    <a href = "userpage.php{if $T_CURRENT_USER->coreAccess.dashboard != 'hidden'}?ctg=personal{else}?ctg=personal&op=account{/if}" class="headerText">#filter:login-{$smarty.session.s_login}#</a>
   {if $T_CURRENT_USER->coreAccess.personal_messages != 'hidden' && $T_CONFIGURATION.disable_messages != 1}
    <span class = "headerText">
     <img class = "ajaxHandle" src = "images/16x16/mail.png" alt = "{$smarty.const._MESSAGES}" title = "{$smarty.const._MESSAGES}" onclick = "location='userpage.php?ctg=messages'"/>
     <span id = "header_total_messages"></span>
    </span>
   {/if}
   {if $T_MAPPED_ACCOUNTS}
    <span class = "headerText"></span>
    <select class = "inputSelectMed" onchange = "if (this.value) changeAccount(this.value)" >
     <option value="">[{$smarty.const._SWITCHACCOUNT}]</option>
     {foreach name = 'additional_accounts' item = "item" key = "key" from = $T_MAPPED_ACCOUNTS}
     <option value="{$item.login}">#filter:login-{$item.login}#</option>
                 {/foreach}
             </select>
            {/if}
      <a class = "headerText" href = "index.php?logout=true">{$smarty.const._LOGOUT}</a>
  {/if}
  {if $T_THEME_SETTINGS->options.sidebar_interface != 0 && $T_HEADER_CLASS == 'header'}{$smarty.capture.t_path_additional_code}{/if}
 </div>
 {/if}
 {if $T_CONFIGURATION.motto_on_header}
  <div id = "info">
   <div id = "site_name" class= "headerText">{$T_CONFIGURATION.site_name}</div>
   <div id = "site_motto" class= "headerText">{$T_CONFIGURATION.site_motto}</div>
  </div>
 {/if}
 <div id = "path">
  <div id = "path_title">{$title|eF_formatTitlePath}</div>
  <div id = "tab_handles_div">{if $T_THEME_SETTINGS->options.sidebar_interface == 0 || $T_HEADER_CLASS == 'headerHidden'}{$smarty.capture.t_path_additional_code}{/if}</div>
  <div id = "path_language">
  {if $smarty.server.PHP_SELF|basename != 'index.php' && $T_THEME_SETTINGS->options.sidebar_interface != 0 && $smarty.session.s_login}
            <form action = "{$smarty.server.PHP_SELF}?ctg={if $smarty.session.s_type == 'administrator'}control_panel{else}lessons{/if}&op=search" method = "post">
    <input type = "text" name = "search_text" value = "{$smarty.const._SEARCH}" onclick="if(this.value=='{$smarty.const._SEARCH}')this.value='';" onblur="if(this.value=='')this.value='{$smarty.const._SEARCH}';" class = "searchBox" style = "background-image:url('images/16x16/search.png');"/>
    <input type = "hidden" name = "current_location" id = "current_location" />
   </form>
  {else}
   {$smarty.capture.header_language_code}
  {/if}
  </div>
 </div>
