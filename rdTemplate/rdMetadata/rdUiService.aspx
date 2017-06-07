<%@ Page Language="vb" Trace="False" EnableSessionState="ReadOnly" %>
<%
    Dim ui As New rdMetadata.rdUiService
    ui.ServiceRequest()
%>
<head id="head1" runat="server" visible="false" />